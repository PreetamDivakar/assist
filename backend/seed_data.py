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
        if db.query(PersonalDetail).filter(PersonalDetail.person == "jiya").count() == 0:
            print("Seeding Personal Details for jiya...")
            db.add(PersonalDetail(
                person="jiya",
                clothing_sizes={
                    "shirt_size": "M (38)",
                    "pant_size": "28 (S)",
                    "undergarment_size": "32B",
                    "dress_size": "S",
                    "shoe_size": "5 (UK)"
                },
                personal={
                    "height_cm": "165",
                    "height_ft": "5'5\"",
                    "blood_group": "A+",
                    "company": "Tech Corp",
                    "fav_colour": "Lavender"
                }
            ))
        
        if db.query(PersonalDetail).filter(PersonalDetail.person == "pree").count() == 0:
            print("Seeding Personal Details for pree...")
            db.add(PersonalDetail(
                person="pree",
                clothing_sizes={
                    "shirt_size": "L (42)",
                    "pant_size": "32 (L)",
                    "underwear_size": "L",
                    "baniyan_size": "100 (XL)",
                    "shoe_size": "9 (UK)"
                },
                personal={
                    "height_cm": "180",
                    "height_ft": "5'11\"",
                    "blood_group": "O+",
                    "company": "Design Studio",
                    "fav_colour": "Midnight Blue"
                }
            ))

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
