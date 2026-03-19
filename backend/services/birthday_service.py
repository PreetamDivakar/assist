from datetime import date, timedelta
from sqlalchemy.orm import Session
from models.models import Birthday


def compute_days_remaining(birthday_date: date) -> int:
    """Compute days remaining until next occurrence of this birthday."""
    today = date.today()
    this_year = birthday_date.replace(year=today.year)
    if this_year < today:
        this_year = birthday_date.replace(year=today.year + 1)
    return (this_year - today).days


def enrich_birthday(birthday: Birthday) -> dict:
    """Add computed fields to a birthday record."""
    days = compute_days_remaining(birthday.date)
    return {
        "id": birthday.id,
        "name": birthday.name,
        "date": birthday.date,
        "notes": birthday.notes,
        "reminder_enabled": birthday.reminder_enabled,
        "days_remaining": days,
        "is_upcoming": days <= 5,
        "created_at": birthday.created_at,
        "updated_at": birthday.updated_at,
    }


def get_all_birthdays(db: Session) -> list[dict]:
    birthdays = db.query(Birthday).all()
    return [enrich_birthday(b) for b in birthdays]


def get_birthday_by_id(db: Session, birthday_id: int):
    birthday = db.query(Birthday).filter(Birthday.id == birthday_id).first()
    if birthday:
        return enrich_birthday(birthday)
    return None


def get_birthdays_by_month(db: Session, month: int) -> list[dict]:
    birthdays = db.query(Birthday).all()
    results = []
    for b in birthdays:
        if b.date.month == month:
            results.append(enrich_birthday(b))
    results.sort(key=lambda x: x["days_remaining"])
    return results


def search_birthdays(db: Session, query: str) -> list[dict]:
    birthdays = db.query(Birthday).filter(
        Birthday.name.ilike(f"%{query}%")
    ).all()
    return [enrich_birthday(b) for b in birthdays]


def create_birthday(db: Session, data: dict) -> dict:
    birthday = Birthday(**data)
    db.add(birthday)
    db.commit()
    db.refresh(birthday)
    return enrich_birthday(birthday)


def update_birthday(db: Session, birthday_id: int, data: dict):
    # Explicitly fetch and update
    birthday = db.query(Birthday).filter(Birthday.id == birthday_id).first()
    if not birthday:
        return None

    # Update fields
    for key, value in data.items():
        if value is not None:
            if key == "date" and isinstance(value, str):
                value = date.fromisoformat(value.split('T')[0])
            setattr(birthday, key, value)
    
    try:
        db.add(birthday)
        db.flush()
        db.commit()
        db.refresh(birthday)
    except Exception as e:
        db.rollback()
        raise e
        
    return enrich_birthday(birthday)


def delete_birthday(db: Session, birthday_id: int) -> bool:
    birthday = db.query(Birthday).filter(Birthday.id == birthday_id).first()
    if not birthday:
        return False
    db.delete(birthday)
    db.commit()
    return True
