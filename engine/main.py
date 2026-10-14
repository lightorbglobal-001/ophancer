import os
import json
import time
from datetime import datetime, timezone, timedelta
from engine.collectors.rss_collector import RSSCollector
from engine.collectors.greenhouse_collector import GreenhouseCollector
from engine.collectors.social_collector import SocialCommunityCollector
from engine.collectors.remotive_collector import RemotiveCollector
from engine.collectors.nigeria_collector import NigeriaCollector
from engine.notifier import TelegramNotifier
from engine.supabase_sync import sync_to_supabase

# Auto-load .env file for local development and daemon runs
if os.path.exists(".env"):
    try:
        with open(".env", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    if k.strip() not in os.environ:
                        os.environ[k.strip()] = v.strip()
    except Exception:
        pass

def stamp_expiry_and_prune(opportunities: list) -> tuple[list, int]:
    """
    Enforces dynamic opportunity lifecycles:
    - Freelance Client Gigs & Informal Requests: 5-Day Expiry (fast-turnaround)
    - Formal Job Vacancies & Corporate Roles:    14-Day Expiry
    Automatically prunes stale opportunities from the platform feed.
    """
    now = datetime.now(timezone.utc)
    active = []
    expired_count = 0

    for opp in opportunities:
        # Calculate or backfill expires_at
        expires_at_str = opp.get("expires_at")
        if not expires_at_str:
            discovered_at_str = opp.get("discovered_at")
            try:
                disc_dt = datetime.fromisoformat(discovered_at_str.replace("Z", "+00:00"))
                if disc_dt.tzinfo is None:
                    disc_dt = disc_dt.replace(tzinfo=timezone.utc)
            except Exception:
                disc_dt = now

            ttl_days = 5 if opp.get("opportunity_type") == "service_request" else 14
            expires_dt = disc_dt + timedelta(days=ttl_days)
            opp["expires_at"] = expires_dt.isoformat()
        else:
            try:
                expires_dt = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))
                if expires_dt.tzinfo is None:
                    expires_dt = expires_dt.replace(tzinfo=timezone.utc)
            except Exception:
                expires_dt = now + timedelta(days=14)

        if expires_dt < now:
            expired_count += 1
            opp["status"] = "expired"
        else:
            opp["status"] = "published"
            active.append(opp)

    return active, expired_count

def run_discovery_cycle():
    start_time = time.time()
    print("=" * 75)
    print(f"[Ophancer Discovery Engine] Starting cycle at {datetime.now(timezone.utc).isoformat()}")
    print("=" * 75)

    # 1. Initialize Multi-Channel Collectors
    collectors = [
        # A. Nigerian & Pan-African Verified Vacancies (HotNigerianJobs Feed)
        NigeriaCollector(
            feed_url="https://www.hotnigerianjobs.com/feed/",
            max_items=35
        ),

        # B. Global Remote Tech, Design & VA (Official Remotive API - 0 rate limits)
        RemotiveCollector(
            limit=50
        ),

        # C. Established Remote Boards (WeWorkRemotely Multi-Category)
        RSSCollector(
            feed_url="https://weworkremotely.com/categories/remote-programming-jobs.rss", 
            source_name="WeWorkRemotely Dev", 
            category_id="web-dev"
        ),
        RSSCollector(
            feed_url="https://weworkremotely.com/categories/remote-customer-support-jobs.rss", 
            source_name="WeWorkRemotely VA/Support", 
            category_id="va"
        ),

        # D. Enterprise ATS (Greenhouse Public API)
        GreenhouseCollector(
            company_token="gitlab", 
            company_name="GitLab Global", 
            category_id="web-dev"
        ),

        # E. Social Media & Creator Communities (Polite delays & Rate-Limit Backoff)
        SocialCommunityCollector(
            community_url="https://www.reddit.com/r/forhire/new/.rss", 
            community_name="Reddit r/forhire", 
            default_category="web-dev"
        ),
        SocialCommunityCollector(
            community_url="https://www.reddit.com/r/freelance_forhire/new/.rss", 
            community_name="Reddit r/freelance_forhire", 
            default_category="graphic-design"
        )
    ]

    all_harvested = []
    social_count = 0
    formal_count = 0
    nigeria_count = 0

    for c in collectors:
        print(f"[*] Running collector: {c.source_name}...")
        found = c.collect()
        print(f"    -> Harvested {len(found)} opportunities.")
        
        for opp in found:
            if opp.get("source_name") == "HotNigerianJobs NG":
                nigeria_count += 1
            if opp.get("opportunity_type") == "service_request":
                social_count += 1
            else:
                formal_count += 1

        all_harvested.extend(found)

    print("-" * 75)
    print(f"[Harvest Telemetry Summary]:")
    print(f"  • Nigerian & African Vacancies:             {nigeria_count}")
    print(f"  • Social Media & Freelance Client Requests: {social_count}")
    print(f"  • Global Remote & Corporate Vacancies:     {formal_count - nigeria_count}")
    print(f"  • Total Opportunities Ingested:             {len(all_harvested)}")
    print("-" * 75)

    # 2. Local Cache & SHA-256 Deduplication
    os.makedirs("engine/output", exist_ok=True)
    cache_file = "engine/output/opportunities.json"
    existing_hashes = set()

    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cached_data = json.load(f)
                for item in cached_data:
                    existing_hashes.add(item.get("source_identifier"))
        except Exception:
            cached_data = []
    else:
        cached_data = []

    new_unique = []
    for opp in all_harvested:
        h = opp.get("source_identifier")
        if h and h not in existing_hashes:
            new_unique.append(opp)
            existing_hashes.add(h)

    print(f"[Deduplication Radar]: {len(new_unique)} genuinely NEW unique opportunities identified.")

    # Save to local cache (enforcing 5-day / 14-day expiry)
    combined = new_unique + cached_data
    active_opportunities, pruned_count = stamp_expiry_and_prune(combined)
    print(f"[Lifecycle Expiry Radar]: {pruned_count} stale listings pruned. {len(active_opportunities)} active listings remain.")

    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(active_opportunities[:300], f, indent=2, ensure_ascii=False)

    # 3. Synchronize with Website Database / Frontend Seed
    frontend_seed = "src/data/discovered_opportunities.json"
    os.makedirs("src/data", exist_ok=True)
    with open(frontend_seed, "w", encoding="utf-8") as f:
        json.dump(active_opportunities[:300], f, indent=2, ensure_ascii=False)
    print(f"[Sync]: Updated frontend data feed at {frontend_seed}.")

    # 4. Supabase Cloud Sync (Upsert to PostgreSQL database)
    sync_to_supabase(new_unique if new_unique else active_opportunities[:30])

    # 5. Telegram Alerts Dispatch (Broadcast top new opportunities)
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    channel_id = os.environ.get("TELEGRAM_CHANNEL_ID", "").strip()
    notifier = TelegramNotifier(bot_token, channel_id)

    if new_unique and bot_token and channel_id:
        print(f"[*] Dispatching top {min(3, len(new_unique))} alerts to Telegram channel {channel_id}...")
        for opp in new_unique[:3]:
            notifier.broadcast_opportunity(opp)
    else:
        print("[*] Skipping live Telegram dispatch (offline / simulation mode).")

    duration = round(time.time() - start_time, 2)
    print("=" * 75)
    print(f"[Ophancer Discovery Engine] Completed cycle in {duration}s.")
    print(f"  • New Unique: {len(new_unique)}")
    print(f"  • Total Active in Index: {len(combined[:400])}")
    print("=" * 75)

if __name__ == "__main__":
    run_discovery_cycle()
