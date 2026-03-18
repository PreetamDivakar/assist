import os
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class SubscriptionRequest(BaseModel):
    endpoint: str
    keys: dict  # {"p256dh": "...", "auth": "..."}


class UnsubscribeRequest(BaseModel):
    endpoint: str


@router.get("/vapid-public-key")
def get_vapid_key():
    """Return the VAPID public key for the frontend to use when subscribing."""
    public_key = os.getenv("VAPID_PUBLIC_KEY", "")
    return {"public_key": public_key}


@router.post("/subscribe")
def subscribe(data: SubscriptionRequest, db: Session = Depends(get_db)):
    """Subscribe to push notifications."""
    sub = notification_service.save_subscription(db, {
        "endpoint": data.endpoint,
        "keys": data.keys,
    })
    return {"message": "Subscribed successfully", "id": sub.id}


@router.post("/unsubscribe")
def unsubscribe(data: UnsubscribeRequest, db: Session = Depends(get_db)):
    """Unsubscribe from push notifications."""
    removed = notification_service.remove_subscription(db, data.endpoint)
    if not removed:
        return {"message": "Subscription not found"}
    return {"message": "Unsubscribed successfully"}


@router.post("/test")
def test_notification(db: Session = Depends(get_db)):
    """Send a test notification to all subscribers."""
    result = notification_service.send_notification(
        db,
        title="🔔 Test Notification",
        body="Your Personal Assistant notifications are working!",
        url="/"
    )
    return result


@router.post("/check-daily")
def check_daily(db: Session = Depends(get_db)):
    """Manually trigger the daily notification check."""
    result = notification_service.check_and_send_daily_notifications(db)
    return result
