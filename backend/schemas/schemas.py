from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


# ─── Birthday Schemas ───────────────────────────────────────────

class BirthdayCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    date: date
    notes: Optional[str] = ""
    reminder_enabled: Optional[bool] = True


class BirthdayUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    date: Optional[date] = None
    notes: Optional[str] = None
    reminder_enabled: Optional[bool] = None


class BirthdayResponse(BaseModel):
    id: int
    name: str
    date: date
    notes: Optional[str] = ""
    reminder_enabled: Optional[bool] = True
    days_remaining: Optional[int] = None
    is_upcoming: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Personal Detail Schemas ────────────────────────────────────

class PersonalDetailUpdate(BaseModel):
    clothing_sizes: Optional[dict] = None
    contact_info: Optional[dict] = None
    preferences: Optional[dict] = None


class PersonalDetailResponse(BaseModel):
    id: int
    person: str
    clothing_sizes: dict
    contact_info: dict
    preferences: dict
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Note Schemas ───────────────────────────────────────────────

class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = ""


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None


class NoteResponse(BaseModel):
    id: int
    person: str
    title: str
    content: Optional[str] = ""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Bucket List Schemas ────────────────────────────────────────

class BucketListCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class BucketListUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    completed: Optional[bool] = None


class BucketListResponse(BaseModel):
    id: int
    person: str
    title: str
    completed: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Event Schemas ──────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    date: date
    category: Optional[str] = Field("custom", pattern="^(birthday|personal|custom)$")
    description: Optional[str] = ""
    recurring: Optional[bool] = False


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    date: Optional[date] = None
    category: Optional[str] = Field(None, pattern="^(birthday|personal|custom)$")
    description: Optional[str] = None
    recurring: Optional[bool] = None


class EventResponse(BaseModel):
    id: int | None = None
    title: str
    date: date
    category: str
    description: Optional[str] = ""
    recurring: Optional[bool] = False
    days_remaining: Optional[int] = None
    status: Optional[str] = None  # "today" / "tomorrow" / "upcoming" / "past"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Dashboard Schemas ──────────────────────────────────────────

class DashboardResponse(BaseModel):
    upcoming_events_count: int
    today_events_count: int
    upcoming_birthdays_count: int
    bucket_list_total: int
    bucket_list_completed: int
