"""
Notes REST API - Production-quality FastAPI backend for a notes app.
Uses in-memory storage with Pydantic validation, enums, and unified error handling.
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Any, List, Optional

from fastapi import FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, computed_field, field_validator, model_validator
from starlette.exceptions import HTTPException as StarletteHTTPException


# -----------------------------------------------------------------------------
# Enums
# -----------------------------------------------------------------------------


class Priority(str, Enum):
    """Priority levels for a note."""

    HIGH = "high"
    NORMAL = "normal"
    LOW = "low"


class Status(str, Enum):
    """Filter status for listing notes: all, done, or pending."""

    ALL = "all"
    DONE = "done"
    PENDING = "pending"


# -----------------------------------------------------------------------------
# Pydantic Models
# -----------------------------------------------------------------------------


def _validate_tags(tags: List[str]) -> List[str]:
    """
    Normalize tags: lowercase, strip whitespace, remove duplicates.
    Enforces max 10 tags. Used by both NoteCreate and NoteUpdate.
    """
    if not tags:
        return []
    normalized = []
    seen = set()
    for t in tags:
        cleaned = str(t).strip().lower()
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            normalized.append(cleaned)
        if len(normalized) >= 10:
            break
    return normalized


class NoteCreate(BaseModel):
    """Payload for creating a new note. Server assigns id, done, timestamps."""

    title: str = Field(..., min_length=1, max_length=100, description="Note title")
    content: str = Field(..., min_length=1, max_length=5000, description="Note content")
    priority: Priority = Field(default=Priority.NORMAL, description="Note priority")
    tags: List[str] = Field(default_factory=list, max_length=10, description="Up to 10 tags")

    @field_validator("title", mode="before")
    @classmethod
    def title_strip_and_not_whitespace(cls, v: Any) -> str:
        """Strip whitespace and ensure title is not empty or only whitespace."""
        if not isinstance(v, str):
            raise ValueError("Title must be a string")
        stripped = v.strip()
        if not stripped:
            raise ValueError("Title cannot be empty or only whitespace")
        return stripped

    @field_validator("content", mode="before")
    @classmethod
    def content_strip(cls, v: Any) -> str:
        """Strip leading/trailing whitespace from content."""
        if not isinstance(v, str):
            raise ValueError("Content must be a string")
        return v.strip()

    @field_validator("tags", mode="before")
    @classmethod
    def tags_normalize(cls, v: Any) -> List[str]:
        """Normalize tags: lowercase, stripped, no duplicates, max 10."""
        if v is None:
            return []
        if not isinstance(v, list):
            raise ValueError("Tags must be a list")
        return _validate_tags(v)


class NoteUpdate(BaseModel):
    """Payload for partial updates. All fields optional; same validators when provided."""

    title: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    priority: Optional[Priority] = None
    done: Optional[bool] = None
    tags: Optional[List[str]] = Field(None, max_length=10)

    @field_validator("title", mode="before")
    @classmethod
    def title_strip_and_not_whitespace(cls, v: Any) -> Optional[str]:
        """When title is provided, strip and ensure not empty/whitespace-only."""
        if v is None:
            return None
        if not isinstance(v, str):
            raise ValueError("Title must be a string")
        stripped = v.strip()
        if not stripped:
            raise ValueError("Title cannot be empty or only whitespace")
        return stripped

    @field_validator("content", mode="before")
    @classmethod
    def content_strip(cls, v: Any) -> Optional[str]:
        """When content is provided, strip whitespace."""
        if v is None:
            return None
        if not isinstance(v, str):
            raise ValueError("Content must be a string")
        return v.strip()

    @field_validator("tags", mode="before")
    @classmethod
    def tags_normalize(cls, v: Any) -> Optional[List[str]]:
        """When tags are provided, normalize: lowercase, stripped, no duplicates, max 10."""
        if v is None:
            return None
        if not isinstance(v, list):
            raise ValueError("Tags must be a list")
        return _validate_tags(v)


class NoteResponse(BaseModel):
    """Full note as returned by the API, including computed preview and ISO timestamps."""

    id: int
    title: str
    content: str
    priority: Priority
    done: bool
    tags: List[str]
    created_at: str
    updated_at: str

    @computed_field
    @property
    def preview(self) -> str:
        """First 100 characters of content, with '...' if truncated."""
        if len(self.content) <= 100:
            return self.content
        return self.content[:100] + "..."


# -----------------------------------------------------------------------------
# Internal storage model (not exposed to API)
# -----------------------------------------------------------------------------


class NoteInDB(BaseModel):
    """Internal note representation with datetime timestamps for storage."""

    id: int
    title: str
    content: str
    priority: Priority
    done: bool = False
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def _note_to_response(note: NoteInDB) -> NoteResponse:
    """Convert internal note to API response format with ISO timestamps and preview."""
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


# -----------------------------------------------------------------------------
# FastAPI app and middleware
# -----------------------------------------------------------------------------


app = FastAPI(title="Notes API", version="2.0.0")


# CORS: allow all origins so any frontend can call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    """Log a message when the application starts."""
    print("Notes API is running!")


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


# -----------------------------------------------------------------------------
# In-memory storage and helpers
# -----------------------------------------------------------------------------


notes_db: List[NoteInDB] = [
    NoteInDB(
        id=1,
        title="First note",
        content="This is your first sample note. Use it to get started with the Notes API.",
        priority=Priority.NORMAL,
        done=False,
        tags=["getting-started"],
    ),
    NoteInDB(
        id=2,
        title="Shopping list",
        content="Milk, Eggs, Bread, Butter, Cheese",
        priority=Priority.HIGH,
        done=False,
        tags=["shopping", "groceries"],
    ),
    NoteInDB(
        id=3,
        title="Ideas backlog",
        content="Try FastAPI for the next project. Consider adding Redis for caching.",
        priority=Priority.LOW,
        done=False,
        tags=["ideas", "tech"],
    ),
    NoteInDB(
        id=4,
        title="Meeting notes",
        content="Discussed Q1 goals. Action items: review docs, schedule follow-up.",
        priority=Priority.HIGH,
        done=True,
        tags=["work", "meetings"],
    ),
    NoteInDB(
        id=5,
        title="Read later",
        content="Article about async Python. Bookmark for weekend reading.",
        priority=Priority.NORMAL,
        done=False,
        tags=["reading", "python"],
    ),
]


def _get_next_id() -> int:
    """Compute the next note id from the current in-memory list."""
    if not notes_db:
        return 1
    return max(n.id for n in notes_db) + 1


def _find_note_index(note_id: int) -> int:
    """Return the index of the note with the given id, or -1 if not found."""
    for i, note in enumerate(notes_db):
        if note.id == note_id:
            return i
    return -1


def _raise_404() -> None:
    """Raise HTTP 404 with a helpful message. Used for not-found cases."""
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")


def _raise_400(detail: str) -> None:
    """Raise HTTP 400 for invalid input that Pydantic does not catch."""
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


# -----------------------------------------------------------------------------
# Routes
# -----------------------------------------------------------------------------


@app.get("/")
def root() -> dict:
    """Return a simple health message and total note count."""
    return {"message": "Notes API", "total_notes": len(notes_db)}


@app.get("/notes/stats")
def get_notes_stats() -> dict:
    """
    Return business metrics: total notes, done count, pending count,
    and counts by priority. Must be defined before /notes/{id} so 'stats'
    is not interpreted as an id.
    """
    total = len(notes_db)
    done = sum(1 for n in notes_db if n.done)
    pending = total - done
    by_priority = {
        "high": sum(1 for n in notes_db if n.priority == Priority.HIGH),
        "normal": sum(1 for n in notes_db if n.priority == Priority.NORMAL),
        "low": sum(1 for n in notes_db if n.priority == Priority.LOW),
    }
    return {
        "total": total,
        "done": done,
        "pending": pending,
        "by_priority": by_priority,
    }


@app.get("/notes")
def list_notes(
    priority: Optional[Priority] = Query(None, description="Filter by priority"),
    status_filter: Optional[Status] = Query(None, alias="status", description="Filter by done/pending"),
    tag: Optional[str] = Query(None, description="Filter by tag (case-insensitive)"),
    limit: int = Query(10, ge=1, le=100, description="Max notes to return"),
    offset: int = Query(0, ge=0, description="Number of notes to skip"),
) -> dict:
    """
    List notes with optional filters and pagination.
    Returns notes array plus total, limit, and offset for client pagination.
    """
    filtered = notes_db

    if priority is not None:
        filtered = [n for n in filtered if n.priority == priority]

    if status_filter == Status.DONE:
        filtered = [n for n in filtered if n.done]
    elif status_filter == Status.PENDING:
        filtered = [n for n in filtered if not n.done]

    if tag is not None:
        tag_lower = tag.strip().lower()
        filtered = [n for n in filtered if tag_lower in [t.lower() for t in n.tags]]

    total = len(filtered)
    paginated = filtered[offset : offset + limit]
    notes_response = [_note_to_response(n) for n in paginated]

    return {
        "notes": notes_response,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@app.get("/notes/{note_id}", response_model=NoteResponse)
def get_note(note_id: int) -> NoteResponse:
    """Return a single note by id. 404 if not found."""
    idx = _find_note_index(note_id)
    if idx == -1:
        _raise_404()
    return _note_to_response(notes_db[idx])


@app.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate) -> NoteResponse:
    """Create a new note with auto-assigned id and timestamps. Return the created note."""
    now = datetime.now(timezone.utc)
    new_note = NoteInDB(
        id=_get_next_id(),
        title=payload.title,
        content=payload.content,
        priority=payload.priority,
        done=False,
        tags=payload.tags,
        created_at=now,
        updated_at=now,
    )
    notes_db.append(new_note)
    return _note_to_response(new_note)


@app.put("/notes/{note_id}", response_model=NoteResponse)
def replace_note(note_id: int, payload: NoteCreate) -> NoteResponse:
    """Replace an entire note with new data. 404 if not found."""
    idx = _find_note_index(note_id)
    if idx == -1:
        _raise_404()
    now = datetime.now(timezone.utc)
    existing = notes_db[idx]
    replacement = NoteInDB(
        id=note_id,
        title=payload.title,
        content=payload.content,
        priority=payload.priority,
        done=False,
        tags=payload.tags,
        created_at=existing.created_at,
        updated_at=now,
    )
    notes_db[idx] = replacement
    return _note_to_response(replacement)


@app.patch("/notes/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, payload: NoteUpdate) -> NoteResponse:
    """Update only the provided fields. Update updated_at. 404 if not found."""
    idx = _find_note_index(note_id)
    if idx == -1:
        _raise_404()

    stored = notes_db[idx]
    update_data = payload.model_dump(exclude_unset=True)

    # Apply updates, preserving created_at
    updated_note = stored.model_copy(
        update={
            **update_data,
            "updated_at": datetime.now(timezone.utc),
        }
    )
    notes_db[idx] = updated_note
    return _note_to_response(updated_note)


@app.delete("/notes/{note_id}")
def delete_note(note_id: int) -> dict:
    """Delete a note by id. 404 if not found."""
    idx = _find_note_index(note_id)
    if idx == -1:
        _raise_404()
    notes_db.pop(idx)
    return {"message": "deleted"}


@app.get("/notes/search", response_model=List[NoteResponse])
def search_notes(q: str = Query(..., description="Search term for title and content")) -> List[NoteResponse]:
    """Search notes by case-insensitive match in title and content."""
    term = q.strip().lower()
    if not term:
        _raise_400("Search query cannot be empty.")
    results = [
        n
        for n in notes_db
        if term in n.title.lower() or term in n.content.lower()
    ]
    return [_note_to_response(n) for n in results]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
