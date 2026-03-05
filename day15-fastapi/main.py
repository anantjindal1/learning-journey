from typing import List, Optional

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException


class NoteBase(BaseModel):
    """Shared fields for notes that are reused across multiple models."""

    title: str = Field(..., description="Short title of the note")
    content: str = Field(..., description="Full text content of the note")
    priority: str = Field(
        "normal",
        description='Priority of the note: "high", "normal", or "low"',
        pattern="^(high|normal|low)$",
    )


class NoteCreate(NoteBase):
    """Data required from the client when creating a new note."""

    # No extra fields; inherits from NoteBase but intentionally
    # does not include id or done so the server controls them.
    pass


class NoteUpdate(BaseModel):
    """Fields that can be partially updated on an existing note."""

    title: Optional[str] = None
    content: Optional[str] = None
    done: Optional[bool] = None
    priority: Optional[str] = Field(
        None,
        description='Priority of the note: "high", "normal", or "low"',
        pattern="^(high|normal|low)$",
    )


class Note(NoteBase):
    """Full note representation returned in API responses."""

    id: int
    done: bool = False


app = FastAPI(title="Notes API", version="1.0.0")


# Add CORS middleware so any frontend (any origin) can call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    """Run once when the application starts to log a helpful message."""

    print("Notes API is running!")


@app.exception_handler(StarletteHTTPException)
async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Provide a friendly message for 404 errors while preserving others."""

    if exc.status_code == status.HTTP_404_NOT_FOUND:
        # Use a friendly generic message if the detail is the default "Not Found",
        # otherwise keep the specific detail such as "Note not found".
        detail = (
            "Oops! The resource you are looking for does not exist."
            if exc.detail == "Not Found"
            else exc.detail
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": detail},
        )
    # For non-404 errors, mirror the default structure while letting the status code pass through.
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# In-memory storage for notes for this example; in a real app this would be a database.
notes_db: List[Note] = [
    Note(id=1, title="First note", content="This is your first sample note.", done=False, priority="normal"),
    Note(id=2, title="Shopping list", content="Milk, Eggs, Bread", done=False, priority="high"),
    Note(id=3, title="Ideas", content="Try FastAPI for the next project.", done=False, priority="low"),
]


def _get_next_id() -> int:
    """Compute the next note id based on the current in-memory list."""

    if not notes_db:
        return 1
    return max(note.id for note in notes_db) + 1


def _find_note_index(note_id: int) -> int:
    """Return the index of the note with the given id or -1 if it does not exist."""

    for index, note in enumerate(notes_db):
        if note.id == note_id:
            return index
    return -1


@app.get("/")
def root():
    """Return a simple health message and how many notes exist."""

    return {"message": "Notes API", "total_notes": len(notes_db)}


@app.get("/notes", response_model=List[Note])
def list_notes():
    """Return all notes currently stored in memory."""

    return notes_db


@app.get("/notes/{note_id}", response_model=Note)
def get_note(note_id: int):
    """Return a single note by its id or 404 if it does not exist."""

    index = _find_note_index(note_id)
    if index == -1:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return notes_db[index]


@app.post("/notes", response_model=Note, status_code=status.HTTP_201_CREATED)
def create_note(payload: NoteCreate):
    """Create a new note, assign it a new id, and return the created note."""

    new_note = Note(id=_get_next_id(), done=False, **payload.dict())
    notes_db.append(new_note)
    return new_note


@app.put("/notes/{note_id}", response_model=Note)
def replace_note(note_id: int, payload: NoteCreate):
    """Replace an existing note with all-new values from the client."""

    index = _find_note_index(note_id)
    if index == -1:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    updated_note = Note(id=note_id, done=False, **payload.dict())
    notes_db[index] = updated_note
    return updated_note


@app.patch("/notes/{note_id}", response_model=Note)
def update_note(note_id: int, payload: NoteUpdate):
    """Apply a partial update to an existing note using only provided fields."""

    index = _find_note_index(note_id)
    if index == -1:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    stored_note = notes_db[index]
    update_data = payload.dict(exclude_unset=True)
    updated_note = stored_note.copy(update=update_data)
    notes_db[index] = updated_note
    return updated_note


@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    """Delete a note by its id and confirm the deletion."""

    index = _find_note_index(note_id)
    if index == -1:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

    notes_db.pop(index)
    return {"message": "deleted"}


@app.get("/notes/search", response_model=List[Note])
def search_notes(q: str):
    """Search notes by case-insensitive match in title or content."""

    term = q.lower()
    results = [
        note
        for note in notes_db
        if term in note.title.lower() or term in note.content.lower()
    ]
    return results


if __name__ == "__main__":
    # Allow running the app with `python main.py` for convenience in development.
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)