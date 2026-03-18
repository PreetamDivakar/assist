from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models.models import PersonalDetail
from routes import birthdays, jiya, pree, events

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Personal Assistant API",
    description="A personal assistant API for managing birthdays, personal details, notes, bucket lists, and events.",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(birthdays.router)
app.include_router(jiya.router)
app.include_router(pree.router)
app.include_router(events.router)


@app.on_event("startup")
def seed_data():
    """Seed initial personal detail records for Jiya and Pree if they don't exist."""
    db = SessionLocal()
    try:
        for person in ["jiya", "pree"]:
            existing = db.query(PersonalDetail).filter(PersonalDetail.person == person).first()
            if not existing:
                detail = PersonalDetail(
                    person=person,
                    clothing_sizes={"top": "", "bottom": "", "shoe": "", "dress": ""},
                    contact_info={"phone": "", "email": "", "address": ""},
                    preferences={"favorite_color": "", "favorite_food": "", "hobbies": ""},
                )
                db.add(detail)
        db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Personal Assistant API is running", "version": "1.0.0"}
