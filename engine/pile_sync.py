import os
import json
import urllib.request
import urllib.error

def sync_pile_to_supabase(table_name: str, items: list, conflict_col: str = "link") -> int:
    """
    Directly upserts records into any Supabase table via PostgREST with on_conflict resolution.
    Uses pure Python standard library.
    """
    if not items:
        return 0

    supabase_url = os.environ.get("SUPABASE_URL", "https://vmhubcbjjawiiycdhipw.supabase.co").strip().rstrip('/')
    supabase_key = (os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY") or "").strip()

    if not supabase_key:
        # Check local .env file
        if os.path.exists(".env"):
            with open(".env", "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("SUPABASE_SERVICE_KEY="):
                        supabase_key = line.split("=", 1)[1].strip()
                        break

    if not supabase_key:
        print(f"[Supabase Pile Sync] SUPABASE_SERVICE_KEY not found. Stored locally only.")
        return 0

    endpoint = f"{supabase_url}/rest/v1/{table_name}?on_conflict={conflict_col}"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
    }

    total_synced = 0
    batch_size = 30
    for i in range(0, len(items), batch_size):
        chunk = items[i:i + batch_size]
        try:
            req_data = json.dumps(chunk, ensure_ascii=False).encode('utf-8')
            req = urllib.request.Request(endpoint, data=req_data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=20) as resp:
                resp.read()
                total_synced += len(chunk)
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8') if e.fp else str(e)
            print(f"    [Supabase {table_name} Error] HTTP {e.code}: {err_msg}")
        except Exception as e:
            print(f"    [Supabase {table_name} Error]: {e}")

    return total_synced
