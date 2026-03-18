from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, JSON
from sqlalchemy.sql import func
from database import Base


class Birthday(Base):
    __tablename__ = "birthdays"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    date = Column(Date, nullable=False)
    notes = Column(Text, default="")
    reminder_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PersonalDetail(Base):
    __tablename__ = "personal_details"

    id = Column(Integer, primary_key=True, index=True)
    person = Column(String(50), nullable=False, unique=True, index=True)  # "jiya" or "pree"
    clothing_sizes = Column(JSON, default=dict)
    contact_info = Column(JSON, default=dict)
    preferences = Column(JSON, default=dict)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    person = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class BucketListItem(Base):
    __tablename__ = "bucket_list_items"

    id = Column(Integer, primary_key=True, index=True)
    person = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    date = Column(Date, nullable=False, index=True)
    category = Column(String(50), nullable=False, default="custom")  # birthday / personal / custom
    description = Column(Text, default="")
    recurring = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

