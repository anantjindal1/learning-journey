"""
AI Notes Agent with Function Calling
Uses FastAPI + Groq to manage a notes database through natural conversation.
"""

import json
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

# Load environment variables from .env (GROQ_API_KEY)
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

# ---------------------------------------------------------------------------
# In-memory notes database (mutable; reset via POST /agent/reset)
# ---------------------------------------------------------------------------
notes_db = [
    {
        "id": 1,
        "title": "Q1 Planning",
        "content": "Review OKRs and set team goals for Q1",
        "priority": "high",
        "done": False,
    },
    {
        "id": 2,
        "title": "Team Offsite",
        "content": "Plan team building offsite for March. Budget $5000.",
        "priority": "normal",
        "done": False,
    },
    {
        "id": 3,
        "title": "Performance Reviews",
        "content": "Complete performance reviews for all 5 direct reports by Feb 28",
        "priority": "high",
        "done": False,
    },
]
next_id = 4

# Original state for reset
_DEFAULT_NOTES = [
    {"id": 1, "title": "Q1 Planning", "content": "Review OKRs and set team goals for Q1", "priority": "high", "done": False},
    {"id": 2, "title": "Team Offsite", "content": "Plan team building offsite for March. Budget $5000.", "priority": "normal", "done": False},
    {"id": 3, "title": "Performance Reviews", "content": "Complete performance reviews for all 5 direct reports by Feb 28", "priority": "high", "done": False},
]


# ---------------------------------------------------------------------------
# Note management functions (called by the agent via execute_function)
# ---------------------------------------------------------------------------

def create_note(title: str, content: str, priority: str = "normal") -> dict:
    """Creates a new note, adds to notes_db, returns the created note."""
    global next_id
    note = {
        "id": next_id,
        "title": title,
        "content": content,
        "priority": priority,
        "done": False,
    }
    notes_db.append(note)
    next_id += 1
    return note


def get_notes(priority: Optional[str] = None, done: Optional[bool] = None) -> dict:
    """Returns filtered notes list, returns {"notes": [...], "count": X}."""
    filtered = notes_db
    if priority is not None:
        filtered = [n for n in filtered if n["priority"] == priority]
    if done is not None:
        filtered = [n for n in filtered if n["done"] == done]
    return {"notes": filtered, "count": len(filtered)}


def update_note(
    note_id: int,
    title: Optional[str] = None,
    content: Optional[str] = None,
    priority: Optional[str] = None,
    done: Optional[bool] = None,
) -> dict:
    """Updates specified fields of a note, returns updated note or error."""
    for note in notes_db:
        if note["id"] == note_id:
            if title is not None:
                note["title"] = title
            if content is not None:
                note["content"] = content
            if priority is not None:
                note["priority"] = priority
            if done is not None:
                note["done"] = done
            return note
    return {"error": f"Note with id {note_id} not found"}


def delete_note(note_id: int) -> dict:
    """Deletes note by id, returns {"success": True, "message": "..."} or error."""
    for i, note in enumerate(notes_db):
        if note["id"] == note_id:
            notes_db.pop(i)
            return {"success": True, "message": f"Note {note_id} deleted"}
    return {"error": f"Note with id {note_id} not found"}


def search_notes(query: str) -> dict:
    """Searches title and content (case-insensitive), returns matching notes."""
    q = query.lower()
    matches = [
        n
        for n in notes_db
        if q in n["title"].lower() or q in n["content"].lower()
    ]
    return {"notes": matches, "count": len(matches)}


def get_stats() -> dict:
    """Returns {"total": X, "done": X, "pending": X, "high_priority": X}."""
    done_count = sum(1 for n in notes_db if n["done"])
    high_count = sum(1 for n in notes_db if n["priority"] == "high")
    return {
        "total": len(notes_db),
        "done": done_count,
        "pending": len(notes_db) - done_count,
        "high_priority": high_count,
    }


# ---------------------------------------------------------------------------
# Tool definitions for Groq (AI uses these to decide when/how to call)
# ---------------------------------------------------------------------------
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_note",
            "description": "Create a new note with title, content, and optional priority. Use when the user wants to add a new note.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Title of the note"},
                    "content": {"type": "string", "description": "Content/body of the note"},
                    "priority": {
                        "anyOf": [
                            {"type": "null"},
                            {"type": "string", "enum": ["high", "normal", "low"]},
                        ],
                        "description": "Priority level; defaults to normal if not specified",
                    },
                },
                "required": ["title", "content"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_notes",
            "description": "Get notes, optionally filtered by priority or done status. Use when the user wants to list or view notes.",
            "parameters": {
                "type": "object",
                "properties": {
                    "priority": {
                        "anyOf": [
                            {"type": "null"},
                            {"type": "string", "enum": ["high", "normal", "low"]},
                        ],
                        "description": "Filter by priority (optional)",
                    },
                    "done": {
                        "type": ["boolean", "null"],
                        "description": "Filter by done status: true for completed, false for pending (optional)",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_note",
            "description": "Update an existing note by id. Can update title, content, priority, or done status. Use when the user wants to modify a note. Omit optional fields you don't want to change.",
            "parameters": {
                "type": "object",
                "properties": {
                    "note_id": {"type": "integer", "description": "ID of the note to update"},
                    "title": {"type": ["string", "null"], "description": "New title (optional, omit to leave unchanged)"},
                    "content": {"type": ["string", "null"], "description": "New content (optional, omit to leave unchanged)"},
                    "priority": {
                        "anyOf": [
                            {"type": "null"},
                            {"type": "string", "enum": ["high", "normal", "low"]},
                        ],
                        "description": "New priority (optional, omit to leave unchanged)",
                    },
                    "done": {"type": ["boolean", "null"], "description": "Mark as done or pending (optional)"},
                },
                "required": ["note_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_note",
            "description": "Delete a note by id. Use when the user wants to remove a note.",
            "parameters": {
                "type": "object",
                "properties": {
                    "note_id": {"type": "integer", "description": "ID of the note to delete"},
                },
                "required": ["note_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_notes",
            "description": "Search notes by keyword in title or content (case-insensitive). Use when the user wants to find notes matching a search term.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query to match in title or content"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_stats",
            "description": "Get statistics about notes: total count, done count, pending count, high priority count. Use when the user asks for a summary or overview.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]


def _sanitize_message(msg) -> dict:
    """
    Convert a message to a dict with only Groq-supported fields.
    Groq returns messages with extra fields (e.g. 'annotations') that cause
    400 errors when sent back. We strip to: role, content, tool_calls, tool_call_id.
    """
    if isinstance(msg, dict):
        m = dict(msg)
    else:
        m = {"role": getattr(msg, "role", None), "content": getattr(msg, "content", None)}
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            m["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments or "{}"},
                }
                for tc in msg.tool_calls
            ]
    # Keep only supported keys (Groq rejects 'annotations' and other extras)
    allowed = {"role", "content", "tool_calls", "tool_call_id"}
    return {k: v for k, v in m.items() if k in allowed}


def execute_function(name: str, args: dict) -> str:
    """Routes tool calls from the AI to the actual Python functions."""
    functions = {
        "create_note": create_note,
        "get_notes": get_notes,
        "update_note": update_note,
        "delete_note": delete_note,
        "search_notes": search_notes,
        "get_stats": get_stats,
    }
    if name not in functions:
        return json.dumps({"error": f"Unknown function: {name}"})
    # Handle null/empty args from model (e.g. get_notes with no filters)
    if args is None:
        args = {}
    # Strip None for optional params: create_note uses default "normal" when priority omitted
    if name == "create_note" and args.get("priority") is None:
        args = {k: v for k, v in args.items() if k != "priority"}
    result = functions[name](**args)
    return json.dumps(result)


# ---------------------------------------------------------------------------
# Agent loop: the core of function calling
# ---------------------------------------------------------------------------
def run_agent(user_message: str, history: list = None) -> dict:
    """
    Runs the AI agent with function calling support.

    AGENT LOOP (simplified):
    1. Build messages: system prompt + conversation history + new user message
    2. Call Groq with tools; model may respond with text OR request tool calls
    3. If model returns tool_calls:
       - Execute each function locally
       - Append assistant message (with tool_calls) and tool results to messages
       - Call Groq again with updated messages; model generates final text
    4. Return response, tools_used, and updated history
    """
    if history is None:
        history = []

    # Step 1: Build messages
    system_prompt = (
        "You are a helpful notes management assistant. "
        "You have access to tools to create, read, update, delete and search notes. "
        "Always use tools to take actions — don't just describe what to do. "
        "After using a tool, explain what you did in a friendly way."
    )
    messages = [{"role": "system", "content": system_prompt}]
    # Sanitize history: Groq rejects extra fields (e.g. 'annotations') in messages
    messages.extend(_sanitize_message(m) for m in history)
    messages.append({"role": "user", "content": user_message})

    # Step 2: Call Groq with tools (AI decides whether to use them via tool_choice="auto")
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
    )

    message = response.choices[0].message

    if message.tool_calls:
        # Step 3: AI requested one or more function calls
        # Append assistant message ONCE (sanitize to strip unsupported fields like 'annotations')
        messages.append(_sanitize_message(message))

        for tool_call in message.tool_calls:
            function_name = tool_call.function.name
            raw_args = tool_call.function.arguments or "{}"
            function_args = json.loads(raw_args) or {}

            # Execute the actual function
            result = execute_function(function_name, function_args)

            # Add tool result to messages (required for next API call)
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                }
            )

        # Step 4: Call Groq again with function results; AI generates human-friendly response
        final_response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
        )
        final_msg = final_response.choices[0].message
        final_text = final_msg.content or ""
        tools_used = [tc.function.name for tc in message.tool_calls]
        messages.append(_sanitize_message(final_msg))
    else:
        # AI responded directly without calling any function
        final_text = message.content or ""
        tools_used = []
        messages.append(_sanitize_message(message))

    # Return sanitized history so client can safely send it back on next turn
    return {
        "response": final_text,
        "tools_used": tools_used,
        "history": [_sanitize_message(m) for m in messages],
    }


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="Notes AI Agent", description="Manage notes via natural conversation")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Health check; lists available tools."""
    return {
        "status": "ok",
        "tools_available": [t["function"]["name"] for t in TOOLS],
    }


@app.get("/notes")
def list_notes():
    """Return all notes directly (bypass AI)."""
    return {"notes": notes_db, "count": len(notes_db)}


class ChatRequest(BaseModel):
    message: str
    history: list = []


@app.post("/agent/chat")
def agent_chat(req: ChatRequest):
    """Chat with the AI agent; it may call tools to manage notes."""
    result = run_agent(req.message, req.history)
    return {
        "response": result["response"],
        "tools_used": result["tools_used"],
        "history": result["history"],
    }


def _reset_notes():
    """Reset notes_db and next_id to defaults."""
    global notes_db, next_id
    notes_db.clear()
    notes_db.extend([dict(n) for n in _DEFAULT_NOTES])
    next_id = 4


@app.post("/agent/reset")
def agent_reset():
    """Clear notes_db back to original 3 notes, reset next_id to 4."""
    _reset_notes()
    return {"message": "Notes reset to defaults"}
