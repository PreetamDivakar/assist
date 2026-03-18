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
                sizes = ", ".join(f"{k}: {v}" for k, v in sizes_dict.items() if v)
                if sizes:
                    lines.append(f"  Clothing: {sizes}")
            if d.contact_info:
                contact_dict = d.contact_info if isinstance(d.contact_info, dict) else json.loads(d.contact_info)
                contacts = ", ".join(f"{k}: {v}" for k, v in contact_dict.items() if v)
                if contacts:
                    lines.append(f"  Contact: {contacts}")
            if d.preferences:
                pref_dict = d.preferences if isinstance(d.preferences, dict) else json.loads(d.preferences)
                prefs = ", ".join(f"{k}: {v}" for k, v in pref_dict.items() if v)
                if prefs:
                    lines.append(f"  Preferences: {prefs}")
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


def ask_ai(db: Session, context: str, user_message: str, chat_history: list = None) -> str:
    """Send question to Groq (Llama 3) with database context and write capabilities."""
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
        ) + "\n\nYou can also add or update data in the database using the provided tools. If a user asks to remember something, add a note, or record an event, use the appropriate tool."

        # Define tools
        tools = [
            {
                "type": "function",
                "function": {
                    "name": "add_note",
                    "description": "Add a new note to the database.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "person": {"type": "string", "enum": ["jiya", "pree"], "description": "The person this note is for."},
                            "title": {"type": "string", "description": "Short title of the note."},
                            "content": {"type": "string", "description": "Full content of the note."}
                        },
                        "required": ["person", "title", "content"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_birthday",
                    "description": "Add a new birthday to the database.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "Name of the person."},
                            "date": {"type": "string", "description": "Date of birth in YYYY-MM-DD format."},
                            "notes": {"type": "string", "description": "Any additional notes about the birthday."}
                        },
                        "required": ["name", "date"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_event",
                    "description": "Add a new event or reminder to the database.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "Title of the event."},
                            "date": {"type": "string", "description": "Date of the event in YYYY-MM-DD format."},
                            "category": {"type": "string", "enum": ["birthday", "personal", "custom"], "description": "Category of the event."},
                            "description": {"type": "string", "description": "Description of the event."},
                            "recurring": {"type": "boolean", "description": "Whether the event repeats annually."}
                        },
                        "required": ["title", "date", "category"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "add_bucket_list_item",
                    "description": "Add a new item to the bucket list.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "person": {"type": "string", "enum": ["jiya", "pree"], "description": "The person this item is for."},
                            "title": {"type": "string", "description": "The bucket list item title."}
                        },
                        "required": ["person", "title"]
                    }
                }
            }
        ]

        # Build conversation history
        messages = [{"role": "system", "content": system_content}]
        
        if chat_history:
            for msg in chat_history[-10:]:  # Keep last 10 messages for context
                role = "user" if msg["role"] == "user" else "assistant"
                messages.append({"role": role, "content": msg["content"]})

        messages.append({"role": "user", "content": user_message})

        # First AI call
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
            tools=tools,
            tool_choice="auto"
        )

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        if tool_calls:
            messages.append(response_message)
            
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                # Execute database operation
                result = "Success"
                try:
                    if function_name == "add_note":
                        new_item = Note(**function_args)
                        db.add(new_item)
                    elif function_name == "add_birthday":
                        # Convert string date to date object
                        function_args['date'] = date.fromisoformat(function_args['date'])
                        new_item = Birthday(**function_args)
                        db.add(new_item)
                    elif function_name == "add_event":
                        function_args['date'] = date.fromisoformat(function_args['date'])
                        new_item = Event(**function_args)
                        db.add(new_item)
                    elif function_name == "add_bucket_list_item":
                        new_item = BucketListItem(**function_args)
                        db.add(new_item)
                    
                    db.commit()
                    result = f"Successfully added the {function_name.replace('add_', '')} to the database."
                except Exception as e:
                    db.rollback()
                    result = f"Error: {str(e)}"

                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": result,
                })

            # Get final AI response after tool results
            second_response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
            )
            return second_response.choices[0].message.content

        if not response or not response.choices:
            return "I'm sorry, I couldn't generate a response for that."
        
        return response_message.content

    except Exception as e:
        return f"Sorry, I ran into an error with Groq: {str(e)}"
