"""
AI-powered notes API using FastAPI and Groq.
Provides endpoints for managing notes and AI-assisted productivity features.
"""

import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# Create Groq client at module level for reuse across all AI requests
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# System prompt used for all AI endpoints — keeps responses concise and productivity-focused
SYSTEM_PROMPT = (
    "You are a productivity assistant for a personal notes app. "
    "Help users be more productive and organized. "
    "Be concise — max 3 sentences unless asked for more. "
    "Respond in plain text, no markdown formatting."
)

# In-memory notes data — in production this would come from a database
notes = [
    {"id": 1, "title": "Product Launch Planning", "content": "Need to coordinate marketing, engineering, and sales teams. Launch date is March 15. Key risks: API not ready, no marketing budget confirmed.", "priority": "high", "done": False},
    {"id": 2, "title": "Team 1:1s", "content": "Schedule weekly 1:1s with all 5 direct reports. Focus on Q1 goals and career development.", "priority": "normal", "done": False},
    {"id": 3, "title": "Quarterly Review Prep", "content": "Prepare slides for board presentation. Revenue up 23%, user growth 45%. Need to address churn rate of 8%.", "priority": "high", "done": False},
    {"id": 4, "title": "Office Supplies", "content": "Order more coffee, notebooks, and printer paper.", "priority": "low", "done": True},
    {"id": 5, "title": "Read Design Thinking Book", "content": "Finish last 3 chapters. Key takeaways so far: user empathy, rapid prototyping, fail fast.", "priority": "low", "done": False},
]

app = FastAPI(title="AI Notes API", description="Productivity notes with Groq AI assistance")

# Enable CORS so frontend apps from any origin can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response models ---

class ChatRequest(BaseModel):
    """Request body for the chat endpoint."""
    message: str
    history: list = []


# --- Helper functions ---

def call_ai(user_message: str, history: list = []) -> str:
    """
    Sends a message to the Groq AI and returns the assistant's reply.
    Uses the productivity system prompt and supports optional conversation history.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        max_tokens=500
    )
    return response.choices[0].message.content


def find_note(note_id: int) -> Optional[dict]:
    """Looks up a note by ID. Returns None if not found."""
    for note in notes:
        if note["id"] == note_id:
            return note
    return None


def format_notes_for_context() -> str:
    """Formats all notes as a readable string for AI context."""
    lines = []
    for n in notes:
        lines.append(f"{n['id']}. [{n['priority']}] {n['title']}: {n['content']}")
    return "\n".join(lines)


# --- Endpoints ---

@app.get("/notes")
def get_notes():
    """
    Returns all notes in the system.
    Used by clients to display the full notes list.
    """
    return notes


@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    Confirms the API is running and reports which AI backend is in use.
    """
    return {"status": "ok", "ai": "groq llama-3.1-8b-instant"}


@app.post("/ai/summarize/{note_id}")
def summarize_note(note_id: int):
    """
    Generates a one-sentence summary of a note using AI.
    Helps users quickly grasp the essence of longer notes.
    """
    note = find_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    try:
        summary = call_ai(
            f"Summarize this note in one sentence: {note['title']} - {note['content']}"
        )
        return {"note_id": note_id, "title": note["title"], "summary": summary}
    except Exception:
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")


@app.post("/ai/improve/{note_id}")
def improve_note(note_id: int):
    """
    Uses AI to improve the clarity and actionability of a note's content.
    Returns both original and improved versions for comparison.
    """
    note = find_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    try:
        improved = call_ai(
            f"Improve the writing of this note. Make it clearer and more actionable: {note['content']}"
        )
        return {"note_id": note_id, "original": note["content"], "improved": improved}
    except Exception:
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")


@app.post("/ai/prioritize")
def prioritize_notes():
    """
    Sends all notes to the AI and gets a suggested priority order for today.
    Helps users focus on what matters most.
    """
    formatted = "\n".join(
        f"{i+1}. [{n['priority']}] {n['title']}: {n['content']}"
        for i, n in enumerate(notes)
    )
    try:
        prioritization = call_ai(
            f"Review these notes and suggest priority order for today. Brief reason for each:\n{formatted}"
        )
        return {"prioritization": prioritization}
    except Exception:
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")


@app.post("/ai/action-items/{note_id}")
def extract_action_items(note_id: int):
    """
    Extracts specific action items from a note as short, verb-led tasks.
    Turns vague notes into a clear to-do list.
    """
    note = find_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    try:
        action_items = call_ai(
            f"Extract specific action items from this note. List each as a short task starting with a verb: {note['content']}"
        )
        return {"note_id": note_id, "action_items": action_items}
    except Exception:
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")


@app.post("/ai/chat")
def chat(request: ChatRequest):
    """
    General-purpose chat with the AI assistant.
    When history is empty, prepends notes context so the AI can answer questions about them.
    Returns the reply and updated history for multi-turn conversations.
    """
    history = request.history or []
    message = request.message

    # If this is the first message, add notes context so the AI knows what the user has
    if not history:
        formatted_notes = format_notes_for_context()
        message_with_context = f"I have these notes:\n{formatted_notes}\n\nMy question: {message}"
    else:
        message_with_context = message

    try:
        reply = call_ai(message_with_context, history)
    except Exception:
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable")

    # Append user message and assistant reply to history for the next turn
    updated_history = history + [
        {"role": "user", "content": message},
        {"role": "assistant", "content": reply},
    ]

    return {"reply": reply, "history": updated_history}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
