import os
import json
import urllib.request
import urllib.error

def sync_to_supabase(opportunities: list) -> dict:
    """
    Directly upserts harvested opportunities into the Supabase PostgreSQL database
    via the Supabase REST API (PostgREST). Uses only Python standard library.
    """
    supabase_url = os.environ.get("SUPABASE_URL", "").strip()
    supabase_key = (os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY") or "").strip()

    if not supabase_url or not supabase_key:
        print("[Supabase Sync] SUPABASE_URL or SUPABASE_KEY not configured. Running in local JSON storage mode.")
        return {"synced": 0, "status": "skipped", "reason": "no_credentials"}

    if not opportunities:
        print("[Supabase Sync] No opportunities to sync.")
        return {"synced": 0, "status": "skipped", "reason": "empty_list"}

    # Format endpoint with on_conflict resolution for upserting
    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/opportunities?on_conflict=source_identifier"

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
    }

    # Clean records for DB format
    payload = []
    for opp in opportunities:
        record = {
            "source_identifier": opp.get("source_identifier"),
            "title": opp.get("title", "Untitled"),
            "slug": opp.get("slug", "opportunity"),
            "company_name": opp.get("company_name", "Undisclosed"),
            "category_id": opp.get("category_id", "web-dev"),
            "category_name": opp.get("category_name", "Tech & Digital"),
            "opportunity_type": opp.get("opportunity_type", "job_vacancy"),
            "work_mode": opp.get("work_mode", "remote"),
            "location": opp.get("location", "Remote"),
            "currency": opp.get("currency", "NGN"),
            "min_budget": opp.get("min_budget"),
            "max_budget": opp.get("max_budget"),
            "budget_raw_text": opp.get("budget_raw_text", "Negotiable"),
            "is_budget_negotiable": bool(opp.get("is_budget_negotiable", True)),
            "source_name": opp.get("source_name", "Discovery Radar"),
            "source_url": opp.get("source_url", ""),
            "description": opp.get("description", "")[:2000],
            "tags": opp.get("tags", []),
            "status": opp.get("status", "published"),
            "discovered_at": opp.get("discovered_at")
        }
        if opp.get("id"):
            record["id"] = opp.get("id")
        payload.append(record)

    total_synced = 0
    # Sync in batches of 40 to avoid oversized request payloads
    batch_size = 40
    for i in range(0, len(payload), batch_size):
        chunk = payload[i:i + batch_size]
        try:
            req_data = json.dumps(chunk, ensure_ascii=False).encode('utf-8')
            req = urllib.request.Request(endpoint, data=req_data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=20) as resp:
                resp_text = resp.read().decode('utf-8')
                res_json = json.loads(resp_text) if resp_text else []
                total_synced += len(chunk)
                print(f"    [Supabase Sync] Batch {i // batch_size + 1} synced successfully ({len(chunk)} items).")
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8') if e.fp else str(e)
            print(f"    [Supabase Sync Error] HTTP {e.code}: {err_msg}")
        except Exception as e:
            print(f"    [Supabase Sync Error] {e}")

    print(f"[Supabase Sync Complete] {total_synced} opportunities stored in cloud database.")
    return {"synced": total_synced, "status": "success"}
