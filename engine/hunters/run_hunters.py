import os
import sys
import time
from datetime import datetime, timezone, timedelta
from engine.hunters.buyer_hunter import BuyerHunter
from engine.hunters.job_hunter import JobHunter

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
    print("=" * 80)

    return buyer_leads, company_jobs

if __name__ == "__main__":
    is_continuous = "--loop" in sys.argv or "-l" in sys.argv
    buyer_leads, company_jobs = run_both_piles_cycle()

    if is_continuous:
        print("\n⚡ [Continuous Mode Active] Loop configured to scan every 15 minutes (900 seconds)...")
        while True:
            time.sleep(900)
            try:
                run_both_piles_cycle()
            except Exception as e:
                print(f"[Error in loop cycle]: {e}")
