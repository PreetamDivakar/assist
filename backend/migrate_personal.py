import sys
import os

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine
from models.models import Base, PersonalDetail

def migrate():
    print("Dropping and re-creating personal_details table...")
    # This is a destructive action, but necessary for the schema change in this dev environment
    PersonalDetail.__table__.drop(bind=engine, checkfirst=True)
    PersonalDetail.__table__.create(bind=engine, checkfirst=True)
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
