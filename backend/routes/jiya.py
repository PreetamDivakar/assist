from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.schemas import (
    PersonalDetailUpdate, PersonalDetailResponse,
    NoteCreate, NoteUpdate, NoteResponse,
    BucketListCreate, BucketListUpdate, BucketListResponse,
)
from services import personal_service

router = APIRouter(prefix="/jiya", tags=["Jiya"])
PERSON = "jiya"


# ─── Personal Details ───────────────────────────────────────────

@router.get("/details", response_model=PersonalDetailResponse)
def get_details(db: Session = Depends(get_db)):
    details = personal_service.get_personal_details(db, PERSON)
    if not details:
        raise HTTPException(status_code=404, detail="Details not found")
    return details


@router.put("/details", response_model=PersonalDetailResponse)
def update_details(data: PersonalDetailUpdate, db: Session = Depends(get_db)):
    return personal_service.update_personal_details(db, PERSON, data.model_dump(exclude_unset=True))


# ─── Notes ──────────────────────────────────────────────────────

@router.get("/notes", response_model=list[NoteResponse])
def list_notes(db: Session = Depends(get_db)):
    return personal_service.get_notes(db, PERSON)


@router.post("/notes", response_model=NoteResponse, status_code=201)
def create_note(data: NoteCreate, db: Session = Depends(get_db)):
    return personal_service.create_note(db, PERSON, data.model_dump())


@router.put("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, data: NoteUpdate, db: Session = Depends(get_db)):
    note = personal_service.update_note(db, note_id, data.model_dump(exclude_unset=True))
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    if not personal_service.delete_note(db, note_id):
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}


# ─── Bucket List ────────────────────────────────────────────────

@router.get("/bucketlist", response_model=list[BucketListResponse])
def list_bucket_items(db: Session = Depends(get_db)):
    return personal_service.get_bucket_list(db, PERSON)


@router.post("/bucketlist", response_model=BucketListResponse, status_code=201)
def create_bucket_item(data: BucketListCreate, db: Session = Depends(get_db)):
    return personal_service.create_bucket_item(db, PERSON, data.model_dump())


@router.put("/bucketlist/{item_id}", response_model=BucketListResponse)
def update_bucket_item(item_id: int, data: BucketListUpdate, db: Session = Depends(get_db)):
    item = personal_service.update_bucket_item(db, item_id, data.model_dump(exclude_unset=True))
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/bucketlist/{item_id}")
def delete_bucket_item(item_id: int, db: Session = Depends(get_db)):
    if not personal_service.delete_bucket_item(db, item_id):
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}
