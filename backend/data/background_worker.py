"""
Standalone background worker for Ambuja Desk.

app.py starts these loops inside `if __name__ == '__main__'`, which never runs
under Gunicorn. In production this module is run as its own single-instance
systemd service (ambuja_desk_worker) so SLA breach checks, auto-close and the
computed-metric sync keep running exactly once per cycle.
"""

import time
import traceback

import database

INTERVAL_SECONDS = 60


def run_once():
    database.auto_check_sla_breaches()
    database.auto_close_resolved_tickets()
    database.sync_computed_ticket_metrics()


def main():
    print("Ambuja Desk background worker started.", flush=True)
    while True:
        try:
            run_once()
        except Exception:
            print("Background task error:", flush=True)
            traceback.print_exc()
        time.sleep(INTERVAL_SECONDS)


if __name__ == '__main__':
    main()
