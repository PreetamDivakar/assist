import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models.models import PersonalDetail
from routes import birthdays, jiya, pree, events, chat

# Create all tables
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # --- Startup ---
    seed_initial_data()
    yield
    # --- Shutdown ---


def seed_initial_data():
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


app = FastAPI(
    title="Personal Assistant API",
    description="A personal assistant API for managing birthdays, personal details, notes, bucket lists, events, and AI chat.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(birthdays.router)
app.include_router(jiya.router)
app.include_router(pree.router)
app.include_router(events.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"message": "Personal Assistant API is running", "version": "2.0.0"}
