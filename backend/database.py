import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Supabase PostgreSQL URL
SQLALCHEMY_DATABASE_URL = "postgresql://postgres.nkdkeqvvvundsicywqxx:jiPree!3525@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,       # Ideal for Supabase connection poolers
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800  # Reconnect after 30 mins to avoid stale connections
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
