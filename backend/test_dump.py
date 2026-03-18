import traceback
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import SessionLocal
from services import event_service

with open("error_log.txt", "w") as f:
    f.write("Starting test...\n")
    try:
        db = SessionLocal()
        reminders = event_service.generate_birthday_reminders(db)
        f.write(f"Success! {len(reminders)}\n")
    except Exception as e:
        f.write(traceback.format_exc())
    finally:
        f.write("Done.\n")
        db.close()
