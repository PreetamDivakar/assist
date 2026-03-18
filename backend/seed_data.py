import sys
import os
from datetime import date, datetime, timedelta

# Add the current directory to sys.path to import from database and models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models.models import Base, Birthday, PersonalDetail, Note, BucketListItem, Event

def seed():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Birthdays
        if db.query(Birthday).count() == 0:
            print("Seeding Birthdays...")
            today = date.today()
            birthdays = [
                Birthday(name="Alice Johnson", date=today + timedelta(days=2), notes="Loves chocolate cake"),
                Birthday(name="Bob Smith", date=today + timedelta(days=15), notes="Getting a new bike"),
                Birthday(name="Charlie Brown", date=date(today.year, 1, 15), notes="Already passed this year"),
            ]
            db.add_all(birthdays)

        # 2. Seed Personal Details (Jiya & Pree)
        for person in ["jiya", "pree"]:
            if db.query(PersonalDetail).filter(PersonalDetail.person == person).count() == 0:
                print(f"Seeding Personal Details for {person}...")
                detail = PersonalDetail(
                    person=person,
                    clothing_sizes={"top": "S", "bottom": "M", "shoes": "7"},
                    contact_info={"email": f"{person}@example.com", "phone": "123-456-7890"},
                    preferences={"color": "Purple", "food": "Pizza", "hobby": "Reading"}
                )
                db.add(detail)

        # 3. Seed Notes
        if db.query(Note).count() == 0:
            print("Seeding Notes...")
            notes = [
                Note(person="jiya", title="Morning Routine", content="Wake up at 7 AM, Yoga for 30 mins."),
                Note(person="pree", title="Project Ideas", content="1. AI Assistant\n2. Portfolio Website"),
            ]
            db.add_all(notes)

        # 4. Seed Bucket List
        if db.query(BucketListItem).count() == 0:
            print("Seeding Bucket List...")
            items = [
                BucketListItem(person="jiya", title="Skydiving in Hawaii", completed=False),
                BucketListItem(person="jiya", title="Learn to cook Pasta", completed=True),
                BucketListItem(person="pree", title="Visit Japan", completed=False),
                BucketListItem(person="pree", title="Write a book", completed=False),
            ]
            db.add_all(items)

        # 5. Seed Events
        if db.query(Event).count() == 0:
            print("Seeding Events...")
            today = date.today()
            events = [
                Event(title="Anniversary Dinner", date=today + timedelta(days=5), category="personal", description="Table booked at 8 PM"),
                Event(title="Tech Conference", date=today + timedelta(days=30), category="custom", description="Main hall, Level 2"),
                Event(title="Mom's Birthday", date=date(today.year, 12, 25), category="birthday", description="Family gathering", recurring=True),
            ]
            db.add_all(events)

        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
