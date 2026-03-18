from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas.schemas import (
    PersonalDetailUpdate, PersonalDetailResponse,
    NoteCreate, NoteUpdate, NoteResponse,
)
from services import personal_service

router = APIRouter(prefix="/pree", tags=["Pree"])
PERSON = "pree"


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
