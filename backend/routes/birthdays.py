from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas.schemas import BirthdayCreate, BirthdayUpdate, BirthdayResponse
from services import birthday_service

router = APIRouter(prefix="/birthdays", tags=["Birthdays"])


@router.get("/", response_model=list[BirthdayResponse])
def list_birthdays(search: str = Query(None), db: Session = Depends(get_db)):
    if search:
        return birthday_service.search_birthdays(db, search)
    return birthday_service.get_all_birthdays(db)


@router.get("/month/{month}", response_model=list[BirthdayResponse])
def list_birthdays_by_month(month: int, db: Session = Depends(get_db)):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    return birthday_service.get_birthdays_by_month(db, month)


@router.get("/{birthday_id}", response_model=BirthdayResponse)
def get_birthday(birthday_id: int, db: Session = Depends(get_db)):
    birthday = birthday_service.get_birthday_by_id(db, birthday_id)
    if not birthday:
        raise HTTPException(status_code=404, detail="Birthday not found")
    return birthday


@router.post("/", response_model=BirthdayResponse, status_code=201)
def create_birthday(data: BirthdayCreate, db: Session = Depends(get_db)):
    return birthday_service.create_birthday(db, data.model_dump())


@router.put("/{birthday_id}", response_model=BirthdayResponse)
def update_birthday(birthday_id: int, data: BirthdayUpdate, db: Session = Depends(get_db)):
    birthday = birthday_service.update_birthday(db, birthday_id, data.model_dump(exclude_unset=True))
    if not birthday:
        raise HTTPException(status_code=404, detail="Birthday not found")
    return birthday


@router.delete("/{birthday_id}")
def delete_birthday(birthday_id: int, db: Session = Depends(get_db)):
    if not birthday_service.delete_birthday(db, birthday_id):
        raise HTTPException(status_code=404, detail="Birthday not found")
    return {"message": "Birthday deleted successfully"}
