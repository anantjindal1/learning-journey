"""
AI Productivity Assistant with FastAPI backend.
Features: Chat (streaming), Research (RAG over company docs), Agent (function calling for notes).
"""

import json
import os
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from groq import Groq
from pydantic import BaseModel

# Load environment variables (GROQ_API_KEY)
load_dotenv()

# ---------------------------------------------------------------------------
# Groq client
# ---------------------------------------------------------------------------
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

# ---------------------------------------------------------------------------
# In-memory vector store (set during lifespan startup)
# ---------------------------------------------------------------------------
_doc_embeddings: list = []
_doc_metadata: list = []
_embedding_model = None

# ---------------------------------------------------------------------------
# Company docs (RAG source)
# ---------------------------------------------------------------------------
docs = [
    {
        "id": "policy-001",
        "title": "Expense Policy",
        "content": "Employees can expense up to $50 without receipt. Amounts $50-$500 require receipt and manager approval. Above $500 requires VP approval. Submit expenses within 30 days via Expensify. Team meals up to $30 per person. Travel booked through TravelPerk only.",
    },
    {
        "id": "policy-002",
        "title": "Hiring Process",
        "content": "All roles need approved headcount before posting. Recruiter screens resumes, hiring manager does technical interview, team does culture interview. Offers need HR approval. Referral bonus is $2000 paid after 6 months. Background checks required for all hires.",
    },
    {
        "id": "policy-003",
        "title": "Meeting Guidelines",
        "content": "No meetings before 10am or after 4pm. All meetings need an agenda. Meetings over 30 min need a decision log. Friday afternoons are no-meeting blocks. Recurring meetings reviewed quarterly. Meeting notes shared within 24 hours.",
    },
    {
        "id": "policy-004",
        "title": "Performance Reviews",
        "content": "Reviews happen twice a year: June and December. Self-review submitted 2 weeks before. Manager review completed 1 week before. Ratings: Exceptional, Exceeds, Meets, Below. Promotion decisions tied to December review. PIP process triggered after 2 consecutive Below ratings.",
    },
    {
        "id": "policy-005",
        "title": "Remote Work",
        "content": "Hybrid model: 3 days office, 2 days remote. Office days are Tuesday, Wednesday, Thursday. Remote Mondays and Fridays. Home office stipend $500 one-time. Internet reimbursement $50/month. Core hours 10am-4pm local time. Team must overlap at least 4 hours daily.",
    },
]


def _index_documents():
    """Initialize in-memory vector store, index all 5 company documents."""
    global _doc_embeddings, _doc_metadata, _embedding_model
    _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    texts = [f"{d['title']}\n\n{d['content']}" for d in docs]
    _doc_embeddings = _embedding_model.encode(texts)
    _doc_metadata = [{"id": d["id"], "title": d["title"], "content": d["content"]} for d in docs]


def _retrieve_docs(query: str, top_k: int = 3) -> list[dict]:
    """Retrieve top-k relevant docs by cosine similarity."""
    if len(_doc_embeddings) == 0:
        return []
    q_emb = _embedding_model.encode([query])
    scores = np.dot(_doc_embeddings, q_emb.T).flatten()
    norms = np.linalg.norm(_doc_embeddings, axis=1) * (np.linalg.norm(q_emb) + 1e-9)
    scores = scores / norms
    top_indices = np.argsort(scores)[::-1][:top_k]
    return [_doc_metadata[i] for i in top_indices]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    _index_documents()
    print("AI Product ready: docs indexed, notes loaded")
    yield
    # shutdown (nothing needed)


# ---------------------------------------------------------------------------
# Notes database (in-memory)
# ---------------------------------------------------------------------------
notes_db = [
    {
        "id": 1,
        "title": "Q1 OKR Planning",
        "content": "Set team OKRs for Q1. Revenue target +30%, NPS above 50, ship mobile app.",
        "priority": "high",
        "done": False,
    },
    {
        "id": 2,
        "title": "Hiring Plan",
        "content": "Hire 3 engineers, 1 designer, 1 PM by Q2. Work with recruiter Sarah.",
        "priority": "high",
        "done": False,
    },
    {
        "id": 3,
        "title": "Board Deck",
        "content": "Prepare board presentation for March 20. Include revenue, growth, roadmap.",
        "priority": "high",
        "done": False,
    },
    {
        "id": 4,
        "title": "Team Lunch",
        "content": "Organize team lunch for Friday. Book restaurant, budget $300.",
        "priority": "low",
        "done": False,
    },
    {
        "id": 5,
        "title": "Read Zero to One",
        "content": "Finish reading Zero to One. Key insight: monopoly vs competition.",
        "priority": "low",
        "done": True,
    },
]
next_id = 6

# ---------------------------------------------------------------------------
# Agent tools (same 6 as Day 26)
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
    """Returns filtered notes list."""
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
    """Updates specified fields of a note."""
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
    """Deletes note by id."""
    for i, note in enumerate(notes_db):
        if note["id"] == note_id:
            notes_db.pop(i)
            return {"success": True, "message": f"Note {note_id} deleted"}
    return {"error": f"Note with id {note_id} not found"}


def search_notes(query: str) -> dict:
    """Searches title and content (case-insensitive)."""
    q = query.lower()
    matches = [
        n
        for n in notes_db
        if q in n["title"].lower() or q in n["content"].lower()
    ]
    return {"notes": matches, "count": len(matches)}


def get_stats() -> dict:
    """Returns stats: total, done, pending, high_priority."""
    done_count = sum(1 for n in notes_db if n["done"])
    high_count = sum(1 for n in notes_db if n["priority"] == "high")
    return {
        "total": len(notes_db),
        "done": done_count,
        "pending": len(notes_db) - done_count,
        "high_priority": high_count,
    }


# ---------------------------------------------------------------------------
# Tool definitions for Groq (agent mode)
# ---------------------------------------------------------------------------
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_note",
            "description": "Create a new note with title, content, and optional priority.",
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
                        "description": "Priority level; defaults to normal",
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
            "description": "Get notes, optionally filtered by priority or done status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "priority": {
                        "anyOf": [
                            {"type": "null"},
                            {"type": "string", "enum": ["high", "normal", "low"]},
                        ],
                    },
                    "done": {"type": ["boolean", "null"]},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "update_note",
            "description": "Update an existing note by id.",
            "parameters": {
                "type": "object",
                "properties": {
                    "note_id": {"type": "integer"},
                    "title": {"type": ["string", "null"]},
                    "content": {"type": ["string", "null"]},
                    "priority": {"anyOf": [{"type": "null"}, {"type": "string", "enum": ["high", "normal", "low"]}]},
                    "done": {"type": ["boolean", "null"]},
                },
                "required": ["note_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_note",
            "description": "Delete a note by id.",
            "parameters": {
                "type": "object",
                "properties": {"note_id": {"type": "integer"}},
                "required": ["note_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_notes",
            "description": "Search notes by keyword in title or content.",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_stats",
            "description": "Get statistics about notes.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]


def _sanitize_message(msg) -> dict:
    """Strip Groq-incompatible fields from messages."""
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
    allowed = {"role", "content", "tool_calls", "tool_call_id"}
    return {k: v for k, v in m.items() if k in allowed}


def execute_function(name: str, args: dict) -> str:
    """Route tool calls to Python functions."""
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
    if args is None:
        args = {}
    if name == "create_note" and args.get("priority") is None:
        args = {k: v for k, v in args.items() if k != "priority"}
    result = functions[name](**args)
    return json.dumps(result)


def run_agent(user_message: str, history: list = None) -> dict:
    """Run agent loop with function calling."""
    if history is None:
        history = []

    system_prompt = (
        "You are a helpful notes management assistant. "
        "You have access to tools to create, read, update, delete and search notes. "
        "Always use tools to take actions — don't just describe what to do. "
        "After using a tool, explain what you did in a friendly way."
    )
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(_sanitize_message(m) for m in history)
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
    )
    message = response.choices[0].message

    if message.tool_calls:
        messages.append(_sanitize_message(message))
        for tool_call in message.tool_calls:
            function_name = tool_call.function.name
            raw_args = tool_call.function.arguments or "{}"
            function_args = json.loads(raw_args) or {}
            result = execute_function(function_name, function_args)
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                }
            )
        final_response = client.chat.completions.create(model=MODEL, messages=messages)
        final_msg = final_response.choices[0].message
        final_text = final_msg.content or ""
        tools_used = [tc.function.name for tc in message.tool_calls]
        messages.append(_sanitize_message(final_msg))
    else:
        final_text = message.content or ""
        tools_used = []
        messages.append(_sanitize_message(message))

    return {
        "response": final_text,
        "tools_used": tools_used,
        "history": [_sanitize_message(m) for m in messages],
    }


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="ProductivityAI",
    description="AI productivity assistant with Chat, Research, and Agent modes",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (must be after routes that shadow paths)
app.mount("/static", StaticFiles(directory="static"), name="static")


# ---------------------------------------------------------------------------
# Request/Response models
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    history: list = []
    mode: str = "chat"  # "chat" | "research"


class AgentRequest(BaseModel):
    message: str
    history: list = []


class CreateNoteRequest(BaseModel):
    title: str
    content: str
    priority: str = "normal"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    """Serve the main SPA."""
    from fastapi.responses import FileResponse
    return FileResponse("static/index.html")


@app.get("/health")
def health():
    return {"status": "ok", "notes": len(notes_db), "docs": len(docs)}


@app.get("/api/notes")
def list_notes():
    return notes_db


@app.get("/api/stats")
def api_stats():
    return get_stats()


@app.post("/api/notes")
def create_note_api(req: CreateNoteRequest):
    """Create note directly (bypass AI)."""
    note = create_note(req.title, req.content, req.priority)
    return note


@app.patch("/api/notes/{note_id}/done")
def toggle_note_done(note_id: int):
    """Toggle done status of a note."""
    for note in notes_db:
        if note["id"] == note_id:
            note["done"] = not note["done"]
            return note
    raise HTTPException(status_code=404, detail="Note not found")


def _stream_chat(messages: list):
    """Stream tokens from Groq chat completion."""
    stream = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        stream=True,
    )
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield f"data: {json.dumps({'token': chunk.choices[0].delta.content})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"


def _stream_research(user_message: str, history: list):
    """Stream with RAG: retrieve docs, build context, stream response, then yield sources."""
    # Retrieve top 3 relevant docs from in-memory vector store
    retrieved = _retrieve_docs(user_message, top_k=3)
    sources = []
    context_parts = []
    for doc in retrieved:
        sources.append({"id": doc["id"], "title": doc["title"]})
        context_parts.append(f"--- {doc['title']} ---\n{doc['content']}")

    context = "\n\n".join(context_parts) if context_parts else "No relevant documents found."

    system_prompt = (
        "You are a helpful assistant that answers questions about company policies and guidelines. "
        "Use ONLY the following context to answer. If the answer is not in the context, say so. "
        "Be concise and accurate.\n\nContext:\n" + context
    )
    messages = [{"role": "system", "content": system_prompt}]
    for m in history:
        if isinstance(m, dict) and m.get("role") in ("user", "assistant") and m.get("content"):
            messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": user_message})

    stream = client.chat.completions.create(model=MODEL, messages=messages, stream=True)
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield f"data: {json.dumps({'token': chunk.choices[0].delta.content})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"
    yield f"data: {json.dumps({'sources': sources})}\n\n"


@app.post("/api/chat/stream")
def chat_stream(req: ChatRequest):
    """Streaming chat: regular or research (RAG) mode."""
    if req.mode == "research":
        return StreamingResponse(
            _stream_research(req.message, req.history),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    # Regular chat
    messages = [{"role": "system", "content": "You are a helpful productivity assistant."}]
    for m in req.history:
        if isinstance(m, dict) and m.get("role") in ("user", "assistant") and m.get("content"):
            messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": req.message})

    return StreamingResponse(
        _stream_chat(messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/agent")
def agent_chat(req: AgentRequest):
    """Agent mode: non-streaming, with function calling."""
    result = run_agent(req.message, req.history)
    return {
        "response": result["response"],
        "tools_used": result["tools_used"],
        "history": result["history"],
    }
