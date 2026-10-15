import os
import sys
import json
import time
from datetime import datetime, timezone, timedelta
from engine.hunters.buyer_hunter import BuyerHunter
from engine.hunters.job_hunter import JobHunter
from engine.hunters.hunter_notifier import HunterTelegramNotifier

# Ensure safe utf-8 terminal printing on Windows
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

# Ensure .env is loaded
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

NOTIFIED_CACHE_FILE = "engine/output/notified_leads.json"

def load_notified_links() -> set:
    if os.path.exists(NOTIFIED_CACHE_FILE):
        try:
            with open(NOTIFIED_CACHE_FILE, "r", encoding="utf-8") as f:
                return set(json.load(f))
        except Exception:
            return set()
    return set()

def save_notified_links(links: set):
    try:
        os.makedirs(os.path.dirname(NOTIFIED_CACHE_FILE), exist_ok=True)
        with open(NOTIFIED_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(list(links)[-500:], f, indent=2)
    except Exception as e:
        print(f"[Error saving notified links]: {e}")

def run_both_piles_cycle():
    wat_now = datetime.now(timezone(timedelta(hours=1)))
    print("=" * 80)
    print(f"🎯 [24/7 Job Hunting Engine] Scan Started at {wat_now.strftime('%Y-%m-%d %I:%M:%S %p WAT')}")
    print("=" * 80)

    # 1. Type 1: Direct Social Buyers
    buyer_hunter = BuyerHunter()
    buyer_leads = buyer_hunter.run_scan()

    print()
    # 2. Type 2: Abuja & Remote Company Jobs
    job_hunter = JobHunter()
    company_jobs = job_hunter.run_scan()

    print("=" * 80)
    print(f"📊 [Scan Complete Summary]:")
    print(f"  • Pile 1 (Direct Social Buyers): {len(buyer_leads)} verified leads in pile")
    print(f"  • Pile 2 (Company Admin/VA Jobs): {len(company_jobs)} vacancies in pile")

    # 3. Telegram Instant Alerts for Fresh Leads
    notifier = HunterTelegramNotifier()
    notified = load_notified_links()
    dispatched_count = 0

    # Dispatch fresh buyers first
    for lead in buyer_leads:
        link = lead.get("link")
        if link and link not in notified:
            print(f"[*] 📲 Dispatching fresh buyer alert to Telegram: {lead.get('title')[:60]}...")
            if notifier.broadcast_buyer(lead):
                notified.add(link)
                dispatched_count += 1
                if dispatched_count >= 2:  # Polite batch limit per cycle
                    break

    # Dispatch top fresh high-priority Abuja / Remote job if any
    for job in company_jobs:
        if job.get("priority") == "HIGH":
            link = job.get("link")
            if link and link not in notified:
                print(f"[*] 📲 Dispatching high-priority vacancy to Telegram: {job.get('job_title')[:60]}...")
                if notifier.broadcast_job(job):
                    notified.add(link)
                    break

    save_notified_links(notified)
    print(f"  • Telegram Alerts Dispatched: {dispatched_count} fresh cards sent to channel")
    print("=" * 80)

    return buyer_leads, company_jobs

if __name__ == "__main__":
    is_continuous = "--loop" in sys.argv or "-l" in sys.argv
    buyer_leads, company_jobs = run_both_piles_cycle()

    if is_continuous:
        print("\n⚡ [Continuous Mode Active] Loop configured to scan every 5 minutes (300 seconds)...")
        while True:
            time.sleep(300)
            try:
                run_both_piles_cycle()
            except Exception as e:
                print(f"[Error in loop cycle]: {e}")

