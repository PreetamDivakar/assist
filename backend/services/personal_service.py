from sqlalchemy.orm import Session
from models.models import PersonalDetail, Note, BucketListItem


# ─── Personal Details ───────────────────────────────────────────

def get_personal_details(db: Session, person: str):
    detail = db.query(PersonalDetail).filter(PersonalDetail.person == person).first()
    return detail


def update_personal_details(db: Session, person: str, data: dict):
    detail = db.query(PersonalDetail).filter(PersonalDetail.person == person).first()
    if not detail:
        detail = PersonalDetail(
            person=person,
            clothing_sizes=data.get("clothing_sizes", {}),
            personal=data.get("personal", {}),
        )
        db.add(detail)
    else:
        for key, value in data.items():
            if value is not None:
                setattr(detail, key, value)
    db.commit()
    db.refresh(detail)
    return detail


# ─── Notes ──────────────────────────────────────────────────────

def get_notes(db: Session, person: str):
    return db.query(Note).filter(Note.person == person).order_by(Note.created_at.desc()).all()


def get_note_by_id(db: Session, note_id: int):
    return db.query(Note).filter(Note.id == note_id).first()


def create_note(db: Session, person: str, data: dict):
    note = Note(person=person, **data)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_note(db: Session, note_id: int, data: dict):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(note, key, value)
    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note_id: int) -> bool:
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        return False
    db.delete(note)
    db.commit()
    return True


# ─── Bucket List ────────────────────────────────────────────────

def get_bucket_list(db: Session, person: str):
    return db.query(BucketListItem).filter(
        BucketListItem.person == person
    ).order_by(BucketListItem.created_at.desc()).all()


def create_bucket_item(db: Session, person: str, data: dict):
    item = BucketListItem(person=person, **data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_bucket_item(db: Session, item_id: int, data: dict):
    item = db.query(BucketListItem).filter(BucketListItem.id == item_id).first()
    if not item:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


def delete_bucket_item(db: Session, item_id: int) -> bool:
    item = db.query(BucketListItem).filter(BucketListItem.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True
