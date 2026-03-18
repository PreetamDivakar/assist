from database import SessionLocal
from services.chat_service import gather_context

db = SessionLocal()
try:
    context = gather_context(db)
    print("SUCCESS. Length of context:", len(context))
except Exception as e:
    import traceback
    traceback.print_exc()
