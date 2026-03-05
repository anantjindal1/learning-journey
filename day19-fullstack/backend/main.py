"""
Notes REST API - FastAPI backend with PostgreSQL, SQLAlchemy, and authentication.
Provides CRUD endpoints for a notes app with user-specific data.
"""

from typing import Optional

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException

from auth import create_token, get_current_user, hash_password, verify_password
from crud import (
    create_note,
    create_user,
    delete_note,
    get_note,
    get_notes,
    get_notes_count,
    get_stats,
    get_user_by_email,
    replace_note,
    search_notes,
    update_note,
)
from database import create_tables, get_db
from models import NoteModel, UserModel
from schemas import (
    NoteCreate,
    NoteListResponse,
    NoteResponse,
    NoteUpdate,
    PriorityEnum,
    Status,
    TokenResponse,
    UserCreate,
    UserResponse,
)

# Import models so create_tables() knows about all tables.
import models  # noqa: F401

app = FastAPI(
    title="Notes API",
    description="REST API for a notes app with PostgreSQL storage and authentication",
    version="4.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Startup: create tables, seed admin user and sample notes
# -----------------------------------------------------------------------------


def _user_to_response(user: UserModel) -> UserResponse:
    """Convert UserModel to UserResponse for API output."""
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
    )


def _seed_admin(db: Session) -> dict:
    """
    Create admin user if not exists. Returns {created: bool} for logging.
    email: admin@notes.com, password: admin123, name: Admin User
    """
    if get_user_by_email(db, "admin@notes.com"):
        return {"created": False}

    create_user(
        db,
        email="admin@notes.com",
        hashed_password=hash_password("admin123"),
        full_name="Admin User",
    )
    return {"created": True}


def _seed_notes(db: Session, admin_user_id: int) -> None:
    """
    Insert 5 sample notes for the admin user if the notes table is empty.
    """
    if db.query(NoteModel).filter(NoteModel.user_id == admin_user_id).count() > 0:
        return

    admin = db.query(UserModel).filter(UserModel.email == "admin@notes.com").first()
    if not admin:
        return

    samples = [
        {
            "user_id": admin.id,
            "title": "First note",
            "content": "This is your first sample note. Use it to get started with the Notes API.",
            "priority": "normal",
            "done": False,
            "tags": "getting-started",
        },
        {
            "user_id": admin.id,
            "title": "Shopping list",
            "content": "Milk, Eggs, Bread, Butter, Cheese",
            "priority": "high",
            "done": False,
            "tags": "shopping,groceries",
        },
        {
            "user_id": admin.id,
            "title": "Ideas backlog",
            "content": "Try FastAPI for the next project. Consider adding Redis for caching.",
            "priority": "low",
            "done": False,
            "tags": "ideas,tech",
        },
        {
            "user_id": admin.id,
            "title": "Meeting notes",
            "content": "Discussed Q1 goals. Action items: review docs, schedule follow-up.",
            "priority": "high",
            "done": True,
            "tags": "work,meetings",
        },
        {
            "user_id": admin.id,
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
    Creates database tables, seeds admin user, and sample notes for admin.
    """
    create_tables()
    from database import SessionLocal

    db = SessionLocal()
    try:
        admin_result = _seed_admin(db)
        admin = get_user_by_email(db, "admin@notes.com")
        if admin:
            _seed_notes(db, admin.id)
        print(
            "Notes API is running! Database tables created and seeded."
            + (" Admin user created." if admin_result.get("created") else " Admin user already exists.")
        )
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
# Auth routes (prefix /auth)
# -----------------------------------------------------------------------------

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register", response_model=TokenResponse)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Register a new user. If email already exists, returns 400.
    Auto-login: returns TokenResponse with access token and user.
    """
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = create_user(
        db,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    token = create_token(user.id, user.email)
    return TokenResponse(access_token=token, user=_user_to_response(user))


@auth_router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Login with email and password. Uses standard OAuth2 form (username=email).
    Returns 401 if user not found or password wrong.
    """
    user = get_user_by_email(db, form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_token(user.id, user.email)
    return TokenResponse(access_token=token, user=_user_to_response(user))


@auth_router.get("/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user)) -> UserResponse:
    """Return the current authenticated user. Requires valid token."""
    return _user_to_response(current_user)


app.include_router(auth_router)


# -----------------------------------------------------------------------------
# Public routes (no auth)
# -----------------------------------------------------------------------------


@app.get("/")
def root() -> dict:
    """Return a simple health message. No auth required."""
    return {"message": "Notes API", "version": "4.0.0"}


# -----------------------------------------------------------------------------
# Note routes (all require authentication)
# -----------------------------------------------------------------------------


@app.get("/notes/stats")
def get_notes_stats(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> dict:
    """
    Return business metrics for the current user's notes.
    Defined before /notes/{id} so 'stats' is not interpreted as an id.
    """
    return get_stats(db, current_user.id)


@app.get("/notes")
def list_notes(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
    priority: Optional[PriorityEnum] = Query(None, description="Filter by priority"),
    status_filter: Optional[Status] = Query(None, alias="status", description="Filter by done/pending"),
    tag: Optional[str] = Query(None, description="Filter by tag (case-insensitive)"),
    limit: int = Query(10, ge=1, le=100, description="Max notes to return"),
    offset: int = Query(0, ge=0, description="Number of notes to skip"),
) -> NoteListResponse:
    """
    List the current user's notes with optional filters and pagination.
    """
    priority_str = priority.value if priority else None
    notes = get_notes(
        db,
        user_id=current_user.id,
        priority=priority_str,
        status_filter=status_filter,
        tag=tag,
        limit=limit,
        offset=offset,
    )
    total = get_notes_count(
        db,
        user_id=current_user.id,
        priority=priority_str,
        status_filter=status_filter,
        tag=tag,
    )
    return NoteListResponse(
        notes=[_note_to_response(n) for n in notes],
        total=total,
        limit=limit,
        offset=offset,
    )


@app.get("/notes/{note_id}", response_model=NoteResponse)
def get_note_route(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> NoteResponse:
    """Return a single note by id. 404 if not found or not owned by user."""
    note = get_note(db, note_id, current_user.id)
    if not note:
        _raise_404()
    return _note_to_response(note)


@app.post("/notes", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note_route(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> NoteResponse:
    """Create a new note for the current user."""
    new_note = create_note(db, payload, user_id=current_user.id)
    return _note_to_response(new_note)


@app.put("/notes/{note_id}", response_model=NoteResponse)
def replace_note_route(
    note_id: int,
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> NoteResponse:
    """Replace an entire note with new data. 404 if not found or not owned."""
    updated = replace_note(db, note_id, payload, current_user.id)
    if not updated:
        _raise_404()
    return _note_to_response(updated)


@app.patch("/notes/{note_id}", response_model=NoteResponse)
def update_note_route(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> NoteResponse:
    """Update only the provided fields. 404 if not found or not owned."""
    updated = update_note(db, note_id, payload, current_user.id)
    if not updated:
        _raise_404()
    return _note_to_response(updated)


@app.delete("/notes/{note_id}")
def delete_note_route(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> dict:
    """Delete a note by id. 404 if not found or not owned."""
    if not delete_note(db, note_id, current_user.id):
        _raise_404()
    return {"message": "deleted"}


@app.get("/notes/search", response_model=list[NoteResponse])
def search_notes_route(
    q: str = Query(..., description="Search term for title and content"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
) -> list[NoteResponse]:
    """Search the current user's notes by title and content."""
    term = q.strip()
    if not term:
        _raise_400("Search query cannot be empty.")
    results = search_notes(db, term, current_user.id)
    return [_note_to_response(n) for n in results]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
