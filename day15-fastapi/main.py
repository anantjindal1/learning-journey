"""
Notes REST API - FastAPI backend with PostgreSQL and SQLAlchemy.
Provides CRUD endpoints for a notes app with filtering, pagination, and search.
"""

from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException

from crud import (
    create_note,
    delete_note,
    get_note,
    get_notes,
    get_notes_count,
    get_stats,
    replace_note,
    search_notes,
    update_note,
)
from database import create_tables, get_db
from models import NoteModel
from schemas import NoteCreate, NoteListResponse, NoteResponse, NoteUpdate, PriorityEnum, Status

# Import models so create_tables() knows about the notes table.
import models  # noqa: F401

app = FastAPI(
    title="Notes API",
    description="REST API for a notes app with PostgreSQL storage",
    version="3.0.0",
)

# CORS: allow all origins so any frontend can call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Startup: create tables and seed data
# -----------------------------------------------------------------------------


def _seed_notes(db: Session) -> None:
    """
    Insert 5 sample notes if the table is empty.
    Provides varied priorities and tags for testing.
    """
    if db.query(NoteModel).count() > 0:
        return

    samples = [
        {
            "title": "First note",
            "content": "This is your first sample note. Use it to get started with the Notes API.",
            "priority": "normal",
            "done": False,
            "tags": "getting-started",
        },
        {
            "title": "Shopping list",
            "content": "Milk, Eggs, Bread, Butter, Cheese",
            "priority": "high",
            "done": False,
            "tags": "shopping,groceries",
        },
        {
            "title": "Ideas backlog",
            "content": "Try FastAPI for the next project. Consider adding Redis for caching.",
            "priority": "low",
            "done": False,
            "tags": "ideas,tech",
        },
        {
            "title": "Meeting notes",
            "content": "Discussed Q1 goals. Action items: review docs, schedule follow-up.",
            "priority": "high",
            "done": True,
            "tags": "work,meetings",
        },
        {
            "title": "Read later",
            "content": "Article about async Python. Bookmark for weekend reading.",
            "priority": "normal",
            "done": False,
            "tags": "reading,python",
        },
    ]

    for s in samples:
        note = NoteModel(**s)
        db.add(note)
    db.commit()


@app.on_event("startup")
async def on_startup() -> None:
    """
    Run when the application starts.
    Creates database tables and seeds sample notes if the table is empty.
    """
    create_tables()
    from database import SessionLocal

    db = SessionLocal()
    try:
        _seed_notes(db)
        print("Notes API is running! Database tables created and seeded.")
    finally:
        db.close()


# -----------------------------------------------------------------------------
# Error handling - unified format: { "error": "...", "detail": "..." }
# -----------------------------------------------------------------------------


def _error_response(status_code: int, error: str, detail: str) -> JSONResponse:
    """Build a JSON error response with the standard format."""
    return JSONResponse(
        status_code=status_code,
        content={"error": error, "detail": detail},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle HTTP exceptions (404, 400, etc.) with unified error format."""
    detail = str(exc.detail) if exc.detail else "An error occurred"
    if exc.status_code == status.HTTP_404_NOT_FOUND:
        detail = "Note not found." if detail == "Not Found" else detail
    return _error_response(exc.status_code, "Request failed", detail)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch unhandled exceptions and return 500 with unified format."""
    return _error_response(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "Internal server error",
        "An unexpected error occurred. Please try again later.",
    )


def _note_to_response(note: NoteModel) -> NoteResponse:
    """Convert SQLAlchemy NoteModel to Pydantic NoteResponse for API output."""
    return NoteResponse(
        id=note.id,
        title=note.title,
        content=note.content,
        priority=note.priority,
        done=note.done,
        tags=note.tags,
        created_at=note.created_at.isoformat(),
        updated_at=note.updated_at.isoformat(),
    )


def _raise_404() -> None:
    """Raise HTTP 404 with a helpful message for not-found cases."""
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")


def _raise_400(detail: str) -> None:
    """Raise HTTP 400 for invalid input that Pydantic does not catch."""
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------


@app.get("/")
def root(db: Session = Depends(get_db)) -> dict:
    """Return a simple health message and total note count."""
    total = get_notes_count(db)
    return {"message": "Notes API", "total_notes": total}


@app.get("/notes/stats")
def get_notes_stats(db: Session = Depends(get_db)) -> dict:
    """
    Return business metrics: total, done, pending, and counts by priority.
    Defined before /notes/{id} so 'stats' is not interpreted as an id.
    """
    return get_stats(db)


@app.get("/notes")
def list_notes(
    db: Session = Depends(get_db),
    priority: Optional[PriorityEnum] = Query(None, description="Filter by priority"),
    status_filter: Optional[Status] = Query(None, alias="status", description="Filter by done/pending"),
    tag: Optional[str] = Query(None, description="Filter by tag (case-insensitive)"),
    limit: int = Query(10, ge=1, le=100, description="Max notes to return"),
    offset: int = Query(0, ge=0, description="Number of notes to skip"),
) -> NoteListResponse:
    """
    List notes with optional filters and pagination.
    Returns notes array plus total, limit, and offset for client pagination.
    """
    priority_str = priority.value if priority else None
    notes = get_notes(db, priority=priority_str, status_filter=status_filter, tag=tag, limit=limit, offset=offset)
    total = get_notes_count(db, priority=priority_str, status_filter=status_filter, tag=tag)
    return NoteListResponse(
        notes=[_note_to_response(n) for n in notes],
        total=total,
        limit=limit,
        offset=offset,
    )


@app.get("/notes/{note_id}", response_model=NoteResponse)
def get_note_route(note_id: int, db: Session = Depends(get_db)) -> NoteResponse:
    """Return a single note by id. 404 if not found."""
    note = get_note(db, note_id)
    if not note:
        _raise_404()
    return _note_to_response(note)


@app.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note_route(payload: NoteCreate, db: Session = Depends(get_db)) -> NoteResponse:
    """Create a new note with auto-assigned id and timestamps. Return the created note."""
    new_note = create_note(db, payload)
    return _note_to_response(new_note)


@app.put("/notes/{note_id}", response_model=NoteResponse)
def replace_note_route(note_id: int, payload: NoteCreate, db: Session = Depends(get_db)) -> NoteResponse:
    """Replace an entire note with new data. Resets done to False. 404 if not found."""
    updated = replace_note(db, note_id, payload)
    if not updated:
        _raise_404()
    return _note_to_response(updated)


@app.patch("/notes/{note_id}", response_model=NoteResponse)
def update_note_route(note_id: int, payload: NoteUpdate, db: Session = Depends(get_db)) -> NoteResponse:
    """Update only the provided fields. Updates updated_at. 404 if not found."""
    updated = update_note(db, note_id, payload)
    if not updated:
        _raise_404()
    return _note_to_response(updated)


@app.delete("/notes/{note_id}")
def delete_note_route(note_id: int, db: Session = Depends(get_db)) -> dict:
    """Delete a note by id. 404 if not found."""
    if not delete_note(db, note_id):
        _raise_404()
    return {"message": "deleted"}


@app.get("/notes/search", response_model=list[NoteResponse])
def search_notes_route(
    q: str = Query(..., description="Search term for title and content"),
    db: Session = Depends(get_db),
) -> list[NoteResponse]:
    """Search notes by case-insensitive match in title and content."""
    term = q.strip()
    if not term:
        _raise_400("Search query cannot be empty.")
    results = search_notes(db, term)
    return [_note_to_response(n) for n in results]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
