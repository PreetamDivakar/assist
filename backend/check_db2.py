import sys
with open("check_out.txt", "w") as f:
    try:
        from database import SessionLocal
        from services.chat_service import gather_context
        db = SessionLocal()
        context = gather_context(db)
        f.write("SUCCESS. Length of context: " + str(len(context)))
    except Exception as e:
        import traceback
        f.write(traceback.format_exc())
