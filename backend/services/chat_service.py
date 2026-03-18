import os
import json
from datetime import date
from sqlalchemy.orm import Session
from models.models import Birthday, PersonalDetail, Note, BucketListItem, Event
from services.event_service import get_next_occurrence


def gather_context(db: Session) -> str:
    """Gather all database data as structured text for the AI prompt."""
    today = date.today()
    sections = []

    # --- Birthdays ---
    birthdays = db.query(Birthday).all()
    if birthdays:
        lines = ["## Birthdays"]
        for b in birthdays:
            b_date = date.fromisoformat(b.date.split('T')[0][:10]) if isinstance(b.date, str) else b.date
            next_occ = get_next_occurrence(b_date)
            days = (next_occ - today).days
            lines.append(
                f"- {b.name}: {b_date.strftime('%B %d')} "
                f"(next: {next_occ.strftime('%B %d, %Y')}, {days} days away)"
                f"{' | Notes: ' + b.notes if b.notes else ''}"
            )
        sections.append("\n".join(lines))

    # --- Personal Details ---
    details = db.query(PersonalDetail).all()
    if details:
        lines = ["## Personal Details"]
        for d in details:
            lines.append(f"### {d.person.title()}")
            if d.clothing_sizes:
                sizes_dict = d.clothing_sizes if isinstance(d.clothing_sizes, dict) else json.loads(d.clothing_sizes)
                sizes = ", ".join(f"{k.replace('_', ' ')}: {v}" for k, v in sizes_dict.items() if v)
                if sizes:
                    lines.append(f"  Clothing: {sizes}")
            if d.personal:
                pers_dict = d.personal if isinstance(d.personal, dict) else json.loads(d.personal)
                pers = ", ".join(f"{k.replace('_', ' ')}: {v}" for k, v in pers_dict.items() if v)
                if pers:
                    lines.append(f"  Personal Info: {pers}")
        sections.append("\n".join(lines))

    # --- Notes ---
    notes = db.query(Note).all()
    if notes:
        lines = ["## Notes"]
        for n in notes:
            lines.append(f"- [{n.person.title()}] {n.title}: {n.content}")
        sections.append("\n".join(lines))

    # --- Bucket List ---
    bucket = db.query(BucketListItem).all()
    if bucket:
        lines = ["## Bucket List"]
        for b in bucket:
            status = "✅" if b.completed else "⬜"
            lines.append(f"- {status} [{b.person.title()}] {b.title}")
        sections.append("\n".join(lines))

    # --- Events ---
    events = db.query(Event).all()
    if events:
        lines = ["## Events"]
        for e in events:
            e_date = date.fromisoformat(e.date.split('T')[0][:10]) if isinstance(e.date, str) else e.date
            next_occ = get_next_occurrence(e_date) if e.recurring else e_date
            days = (next_occ - today).days
            lines.append(
                f"- {e.title} ({e.category}): {e_date.strftime('%B %d, %Y')} "
                f"| {days} days away"
                f"{'| Recurring' if e.recurring else ''}"
                f"{' | ' + e.description if e.description else ''}"
            )
        sections.append("\n".join(lines))

    return "\n\n".join(sections) if sections else "No data found in the database."


SYSTEM_PROMPT = """You are a helpful personal assistant for Preetam. You have access to his personal database which includes birthdays, personal details (for Jiya and Pree), notes, bucket list items, and events.

Today's date is {today}.

Here is all the data from the database:

{context}

Rules:
- Answer questions naturally and conversationally
- When asked about dates, calculate relative time (e.g., "3 days from now", "in 2 weeks")
- If you don't find relevant data, say so honestly
- Keep responses concise but helpful
- Use emojis sparingly for a friendly tone
- If asked about preferences or personal details, reference the exact data
- Never make up data that isn't in the database"""


def get_model_for_query(query: str) -> str:
    """Heuristic to determine which LLM model to use."""
    query_lower = query.lower()
    
    # Simple Query Heuristic:
    # 1. Short messages (greetings, simple questions)
    # 2. No data-related keywords
    data_keywords = [
        "birthday", "event", "jiya", "pree", "note", "list", 
        "preference", "clothing", "size", "height", "blood", 
        "company", "color", "colour", "remind"
    ]
    
    is_data_related = any(kw in query_lower for kw in data_keywords)
    is_short = len(query) < 50
    
    if is_short and not is_data_related:
        return "llama-3.1-8b-instant"
    else:
        return "llama-3.3-70b-versatile"


def ask_ai(context: str, user_message: str, chat_history: list = None) -> str:
    """Send question to Groq with dynamic model selection. Read-only access."""
    from dotenv import load_dotenv
    from pathlib import Path
    
    # Try to find .env in current dir, then in backend/ relative to this file
    env_path = Path(__file__).parent.parent / ".env"
    load_dotenv(dotenv_path=env_path, override=True)
    
    api_key = os.getenv("GROQ_API_KEY", "")

    if not api_key or api_key == "YOUR_GROQ_KEY_HERE" or api_key.startswith("YOUR_"):
        return f"⚠️ Groq AI is not configured yet. Please add your Groq API key to the .env file. Get a free key at https://console.groq.com"

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        system_content = SYSTEM_PROMPT.format(
            today=date.today().strftime("%A, %B %d, %Y"),
            context=context,
        ) + """

IMPORTANT: You have READ-ONLY access to the database context provided above.
- You CANNOT add, update, or delete any data in the database.
- If the user asks you to create/update/delete something (e.g., "add a note", "change my birthday"), you MUST respond with: 
  "⚠️ I'm sorry, I have read-only access to your data. Please use the dashboard to make any changes." 
- You can only Answer questions based on the existing data."""

        # Build conversation history
        messages = [{"role": "system", "content": system_content}]
        
        if chat_history:
            for msg in chat_history[-10:]:  # Keep last 10 messages for context
                role = "user" if msg["role"] == "user" else "assistant"
                messages.append({"role": role, "content": msg["content"]})

        messages.append({"role": "user", "content": user_message})

        model = get_model_for_query(user_message)

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )

        if not response or not response.choices:
            return "I'm sorry, I couldn't generate a response for that."
        
        return response.choices[0].message.content

    except Exception as e:
        return f"Sorry, I ran into an error with Groq: {str(e)}"
