import os
import time
import sys
from datetime import datetime, timezone
from engine.main import run_discovery_cycle

def start_daemon(interval_seconds: int = 300):
    """
    Continuous High-Frequency Discovery Daemon.
    Runs the discovery cycle every `interval_seconds` (default: 300s = 5 minutes).
    Ensures urgent client requests and fresh vacancies are indexed immediately
    on a first-come, first-served basis.
    """
    print("*" * 75)
    print("  OPHANCER REAL-TIME DISCOVERY DAEMON (5-MINUTE HIGH FREQUENCY)")
    print(f"  • Ingestion Interval: {interval_seconds} seconds ({interval_seconds // 60} minutes)")
    print(f"  • Process ID:         {os.getpid()}")
    print(f"  • Started At:         {datetime.now(timezone.utc).isoformat()}")
    print("*" * 75)

    cycle_count = 1
    try:
        while True:
            print(f"\n>>> [Daemon Cycle #{cycle_count}] Triggering live multi-channel harvest...")
            try:
                run_discovery_cycle()
            except Exception as e:
                print(f"[Daemon Error] Cycle #{cycle_count} encountered an error: {e}")

            print(f">>> [Daemon Cycle #{cycle_count}] Finished. Sleeping {interval_seconds}s until next harvest...")
            cycle_count += 1
            time.sleep(interval_seconds)

    except KeyboardInterrupt:
        print("\n[Ophancer Daemon] Stopped gracefully by user.")
        sys.exit(0)

if __name__ == "__main__":
    interval = int(os.environ.get("DISCOVERY_INTERVAL_SECONDS", 300))
    start_daemon(interval)
