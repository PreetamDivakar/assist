import os
import json
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session
from models.models import PushSubscription


def get_vapid_keys():
    """Get VAPID keys from environment variables."""
    public_key = os.getenv("VAPID_PUBLIC_KEY", "")
    private_key = os.getenv("VAPID_PRIVATE_KEY", "")
    email = os.getenv("VAPID_EMAIL", "preetam@example.com")
    return public_key, private_key, email


def save_subscription(db: Session, subscription_info: dict) -> PushSubscription:
    """Save a push subscription to the database."""
    endpoint = subscription_info["endpoint"]
    keys = subscription_info.get("keys", {})

    # Check if already exists
    existing = db.query(PushSubscription).filter(
        PushSubscription.endpoint == endpoint
    ).first()

    if existing:
        existing.keys = keys
        db.commit()
        db.refresh(existing)
        return existing

    sub = PushSubscription(endpoint=endpoint, keys=keys)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def remove_subscription(db: Session, endpoint: str) -> bool:
    """Remove a push subscription."""
    sub = db.query(PushSubscription).filter(
        PushSubscription.endpoint == endpoint
    ).first()
    if not sub:
        return False
    db.delete(sub)
    db.commit()
    return True


def send_notification(db: Session, title: str, body: str, url: str = "/"):
    """Send push notification to all subscribers."""
    public_key, private_key, email = get_vapid_keys()

    if not public_key or not private_key:
        return {"sent": 0, "failed": 0, "error": "VAPID keys not configured"}

    subscriptions = db.query(PushSubscription).all()
    sent = 0
    failed = 0
    to_remove = []

    payload = json.dumps({
        "title": title,
        "body": body,
        "url": url,
        "icon": "/icon-192.png",
    })

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": sub.keys,
                },
                data=payload,
                vapid_private_key=private_key,
                vapid_claims={
                    "sub": f"mailto:{email}",
                },
            )
            sent += 1
        except WebPushException as e:
            if e.response and e.response.status_code in (404, 410):
                to_remove.append(sub.id)
            failed += 1
        except Exception:
            failed += 1

    # Clean up expired subscriptions
    if to_remove:
        db.query(PushSubscription).filter(
            PushSubscription.id.in_(to_remove)
        ).delete(synchronize_session=False)
        db.commit()

    return {"sent": sent, "failed": failed}


def check_and_send_daily_notifications(db: Session):
    """Check for today's birthdays/events and send notifications."""
    from services.event_service import get_today_events, generate_birthday_reminders

    today_events = get_today_events(db)
    birthday_reminders = generate_birthday_reminders(db)
    today_birthdays = [b for b in birthday_reminders if b["days_remaining"] == 0]

    messages = []

    if today_birthdays:
        names = ", ".join(b["title"].replace("'s birthday", "") for b in today_birthdays)
        messages.append(f"🎂 Birthday today: {names}")

    if today_events:
        titles = ", ".join(e["title"] for e in today_events)
        messages.append(f"📅 Events today: {titles}")

    if messages:
        body = " | ".join(messages)
        send_notification(db, "Your Assistant", body)
        return {"notified": True, "message": body}

    return {"notified": False, "message": "No birthdays or events today"}
