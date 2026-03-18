import sys
import os
from sqlalchemy.orm import Session

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from services import event_service
from schemas.schemas import EventResponse

def test():
    db = SessionLocal()
    try:
        print("Fetching reminders...")
        reminders = event_service.generate_birthday_reminders(db)
        print(f"Generated {len(reminders)} reminders.")
        
        for r in reminders:
            print(f"Validating reminder: {r['title']} (ID: {r.get('id')})")
            try:
                # Manually validate against the schema
                validated = EventResponse(**r)
                print(f"  OK: {validated.title}")
            except Exception as e:
                print(f"  VALIDATION ERROR: {e}")
                
        print("\nFetching all events...")
        events = event_service.get_all_events(db)
        print(f"Fetched {len(events)} events.")
        for e in events:
            print(f"Validating event: {e['title']} (ID: {e.get('id')})")
            try:
                validated = EventResponse(**e)
                print(f"  OK: {validated.title}")
            except Exception as e:
                print(f"  VALIDATION ERROR: {e}")

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test()
