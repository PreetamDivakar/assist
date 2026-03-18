import os
from dotenv import load_load
import google.generativeai as genai
from database import SessionLocal
from services.chat_service import gather_context, ask_ai

def run_test():
    import dotenv
    dotenv.load_dotenv()
    
    db = SessionLocal()
    try:
        ctx = gather_context(db)
        print("GATHER CTX SUCCESS. LEN:", len(ctx))
    except Exception as e:
        import traceback
        return "GATHER CTX ERROR: " + traceback.format_exc()
        
    try:
        reply = ask_ai(ctx, "hello", [])
        return "AI REPLY: " + reply
    except Exception as e:
        import traceback
        return "AI ERROR: " + traceback.format_exc()

import sys
with open('test_ai_out.txt', 'w') as f:
    f.write(run_test())
