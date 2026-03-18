import os
from database import SessionLocal
from services.chat_service import gather_context, ask_ai
from models.models import Note

def test_ai_write():
    db = SessionLocal()
    try:
        # 1. Gather context
        ctx = gather_context(db)
        print("Initial context gathered.")
        
        # 2. Ask AI to add a note
        user_msg = "Please add a note for Jiya saying 'She needs to buy milk today'."
        print(f"User: {user_msg}")
        
        reply = ask_ai(db, ctx, user_msg, [])
        print(f"AI Reply: {reply}")
        
        # 3. Verify in database
        note = db.query(Note).filter(Note.person == "jiya", Note.content.contains("milk")).first()
        if note:
            print(f"SUCCESS: Note found in DB: {note.title} - {note.content}")
        else:
            print("FAILURE: Note not found in DB.")
            
    finally:
        db.close()

if __name__ == "__main__":
    test_ai_write()
