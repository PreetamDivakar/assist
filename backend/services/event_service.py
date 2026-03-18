from datetime import date, timedelta
from sqlalchemy.orm import Session
from models.models import Event, Birthday


def get_next_occurrence(event_date) -> date:
    """Safe date replacement that handles Feb 29th for non-leap years."""
    if isinstance(event_date, str):
        event_date = date.fromisoformat(event_date.split('T')[0][:10])
    
    today = date.today()
    try:
        this_year = event_date.replace(year=today.year)
    except ValueError:
        # Handle Feb 29th in non-leap year
        this_year = event_date.replace(month=3, day=1, year=today.year)
    
    if this_year < today:
        try:
            this_year = event_date.replace(year=today.year + 1)
        except ValueError:
            this_year = event_date.replace(month=3, day=1, year=today.year + 1)
    return this_year


def compute_event_days_remaining(event_date) -> int:
    """Compute days remaining until event. For recurring, use next occurrence."""
    if isinstance(event_date, str):
        event_date = date.fromisoformat(event_date.split('T')[0][:10])
    today = date.today()
    if event_date >= today:
        return (event_date - today).days
    
    next_date = get_next_occurrence(event_date)
    return (next_date - today).days


def get_event_status(days_remaining: int) -> str:
    if days_remaining == 0:
        return "today"
    elif days_remaining == 1:
        return "tomorrow"
    elif days_remaining <= 7:
        return "upcoming"
    else:
        return "future"


def enrich_event(event: Event) -> dict:
    today = date.today()
    days = compute_event_days_remaining(event.date)
    if event.recurring:
        next_date = get_next_occurrence(event.date)
        days = (next_date - today).days
    return {
        "id": event.id,
        "title": event.title,
        "date": event.date,
        "category": event.category,
        "description": event.description,
        "recurring": event.recurring,
        "days_remaining": days,
        "status": get_event_status(days),
        "created_at": event.created_at,
        "updated_at": event.updated_at,
    }


def get_all_events(db: Session) -> list[dict]:
    events = db.query(Event).all()
    return sorted([enrich_event(e) for e in events], key=lambda x: x["days_remaining"])


def get_event_by_id(db: Session, event_id: int):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event:
        return enrich_event(event)
    return None


def get_upcoming_events(db: Session, days: int = 7) -> list[dict]:
    all_events = get_all_events(db)
    return [e for e in all_events if 0 <= e["days_remaining"] <= days]


def get_today_events(db: Session) -> list[dict]:
    all_events = get_all_events(db)
    return [e for e in all_events if e["days_remaining"] == 0]


def create_event(db: Session, data: dict) -> dict:
    event = Event(**data)
    db.add(event)
    db.commit()
    db.refresh(event)
    return enrich_event(event)


def update_event(db: Session, event_id: int, data: dict):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return enrich_event(event)


def delete_event(db: Session, event_id: int) -> bool:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return False
    db.delete(event)
    db.commit()
    return True


def generate_birthday_reminders(db: Session) -> list[dict]:
    """Auto-generate reminder-style events from birthday records."""
    birthdays = db.query(Birthday).filter(Birthday.reminder_enabled == True).all()
    reminders = []
    today = date.today()
    for b in birthdays:
        this_year = get_next_occurrence(b.date)
        days = (this_year - today).days
        status = get_event_status(days)
        reminders.append({
            "id": -b.id,
            "title": f"{b.name}'s birthday",
            "date": this_year,
            "category": "birthday",
            "description": b.notes or "",
            "recurring": True,
            "days_remaining": days,
            "status": status,
            "created_at": b.created_at,
            "updated_at": b.updated_at,
        })
    return sorted(reminders, key=lambda x: x["days_remaining"])


def get_dashboard_stats(db: Session) -> dict:
    from models.models import BucketListItem
    all_events = get_all_events(db)
    birthday_reminders = generate_birthday_reminders(db)
    combined = all_events + birthday_reminders

    bucket_items = db.query(BucketListItem).all()
    total = len(bucket_items)
    completed = sum(1 for i in bucket_items if i.completed)

    return {
        "upcoming_events_count": sum(1 for e in combined if 0 < e["days_remaining"] <= 7),
        "today_events_count": sum(1 for e in combined if e["days_remaining"] == 0),
        "upcoming_birthdays_count": sum(1 for e in birthday_reminders if e["days_remaining"] <= 5),
        "bucket_list_total": total,
        "bucket_list_completed": completed,
    }
