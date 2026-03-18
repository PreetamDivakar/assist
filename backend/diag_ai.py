import os
import dotenv
import json
from datetime import date
from sqlalchemy.orm import Session
from database import SessionLocal
from services.chat_service import gather_context, ask_ai

def run_test():
    dotenv.load_dotenv()
    
    db = SessionLocal()
    print("--- Testing Context Gathering ---")
    try:
        ctx = gather_context(db)
        print(f"SUCCESS. Context length: {len(ctx)} chars")
    except Exception as e:
        import traceback
        print("ERROR in gather_context:")
        traceback.print_exc()
        return

    print("\n--- Testing Groq AI Call ---")
    try:
        reply = ask_ai(ctx, "who is anna?", [])
        print(f"GROQ REPLY: {reply}")
    except Exception as e:
        import traceback
        print("ERROR in ask_ai:")
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
