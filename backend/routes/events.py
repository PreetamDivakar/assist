from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from schemas.schemas import EventCreate, EventUpdate, EventResponse, DashboardResponse
from services import event_service

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/")
def list_events(category: str = Query(None), db: Session = Depends(get_db)):
    try:
        events = event_service.get_all_events(db)
        if category:
            events = [e for e in events if e.get("category") == category]
        return events
    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()}


@router.get("/upcoming", response_model=list[EventResponse])
def list_upcoming_events(days: int = Query(7), db: Session = Depends(get_db)):
    return event_service.get_upcoming_events(db, days)


@router.get("/today", response_model=list[EventResponse])
def list_today_events(db: Session = Depends(get_db)):
    return event_service.get_today_events(db)


@router.get("/reminders")
def list_birthday_reminders(db: Session = Depends(get_db)):
    try:
        data = event_service.generate_birthday_reminders(db)
        return data
    except Exception as e:
        import traceback
        return {"error": str(e), "trace": traceback.format_exc()}


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    return event_service.get_dashboard_stats(db)


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = event_service.get_event_by_id(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/", response_model=EventResponse, status_code=201)
def create_event(data: EventCreate, db: Session = Depends(get_db)):
    return event_service.create_event(db, data.model_dump())


@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, data: EventUpdate, db: Session = Depends(get_db)):
    event = event_service.update_event(db, event_id, data.model_dump(exclude_unset=True))
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    if not event_service.delete_event(db, event_id):
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}
