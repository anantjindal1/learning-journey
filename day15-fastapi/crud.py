"""
CRUD (Create, Read, Update, Delete) operations for the Notes API.
Pure database logic—no FastAPI imports. Used by main.py route handlers.
"""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from models import NoteModel
from schemas import NoteCreate, NoteUpdate, Status


def _tags_to_db(tags: List[str]) -> str:
    """Convert list of tags to comma-separated string for DB storage."""
    return ",".join(t.strip() for t in tags if t.strip()) if tags else ""


def _build_notes_query(
    db: Session,
    priority: Optional[str] = None,
    status_filter: Optional[Status] = None,
    tag: Optional[str] = None,
):
    """
    Build base query with optional filters.
    Does not apply limit/offset—caller does that.
    """
    q = db.query(NoteModel)

    if priority is not None:
        q = q.filter(NoteModel.priority == priority)

    if status_filter == Status.DONE:
        q = q.filter(NoteModel.done == True)
    elif status_filter == Status.PENDING:
        q = q.filter(NoteModel.done == False)

    if tag is not None and tag.strip():
        # Tag is stored as comma-separated; match whole tag (e.g. "work" in "work,meetings").
        tag_lower = tag.strip().lower()
        # Wrap in commas to match whole tags: ",work,meetings," contains ",work,"
        q = q.filter(
            func.concat(",", func.lower(NoteModel.tags), ",").contains(f",{tag_lower},")
        )

    return q


def get_notes(
    db: Session,
    priority: Optional[str] = None,
    status_filter: Optional[Status] = None,
    tag: Optional[str] = None,
    limit: int = 10,
    offset: int = 0,
) -> List[NoteModel]:
    """
    Fetch notes with optional filters and pagination.
    Returns list of NoteModel for the requested page.
    """
    q = _build_notes_query(db, priority, status_filter, tag)
    return q.order_by(NoteModel.id).offset(offset).limit(limit).all()


def get_notes_count(
    db: Session,
    priority: Optional[str] = None,
    status_filter: Optional[Status] = None,
    tag: Optional[str] = None,
) -> int:
    """
    Count notes matching the given filters.
    Used for pagination total.
    """
    q = _build_notes_query(db, priority, status_filter, tag)
    return q.count()


def get_note(db: Session, note_id: int) -> Optional[NoteModel]:
    """
    Fetch a single note by id.
    Returns None if not found.
    """
    return db.query(NoteModel).filter(NoteModel.id == note_id).first()


def create_note(db: Session, note: NoteCreate) -> NoteModel:
    """
    Insert a new note into the database.
    Returns the created NoteModel with id and timestamps set.
    """
    db_note = NoteModel(
        title=note.title,
        content=note.content,
        priority=note.priority.value,
        done=False,
        tags=_tags_to_db(note.tags),
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def replace_note(db: Session, note_id: int, note: NoteCreate) -> Optional[NoteModel]:
    """
    Replace an entire note with new data from NoteCreate.
    Resets done to False. Returns the updated NoteModel or None if not found.
    """
    db_note = get_note(db, note_id)
    if not db_note:
        return None

    now = datetime.now(timezone.utc)
    db_note.title = note.title
    db_note.content = note.content
    db_note.priority = note.priority.value
    db_note.done = False
    db_note.tags = _tags_to_db(note.tags)
    db_note.updated_at = now

    db.commit()
    db.refresh(db_note)
    return db_note


def update_note(db: Session, note_id: int, note: NoteUpdate) -> Optional[NoteModel]:
    """
    Partially update a note. Only provided fields are changed.
    updated_at is set automatically by the model's onupdate.
    Returns the updated NoteModel or None if not found.
    """
    db_note = get_note(db, note_id)
    if not db_note:
        return None

    data = note.model_dump(exclude_unset=True)
    for key, value in data.items():
        if key == "tags" and value is not None:
            setattr(db_note, key, _tags_to_db(value))
        elif key == "priority" and value is not None:
            setattr(db_note, key, value.value)
        elif value is not None:
            setattr(db_note, key, value)

    db_note.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_note)
    return db_note


def delete_note(db: Session, note_id: int) -> bool:
    """
    Delete a note by id.
    Returns True if deleted, False if not found.
    """
    db_note = get_note(db, note_id)
    if not db_note:
        return False
    db.delete(db_note)
    db.commit()
    return True


def get_stats(db: Session) -> dict:
    """
    Return business metrics: total, done, pending, and counts by priority.
    """
    total = db.query(NoteModel).count()
    done = db.query(NoteModel).filter(NoteModel.done == True).count()
    pending = total - done

    by_priority = {
        "high": db.query(NoteModel).filter(NoteModel.priority == "high").count(),
        "normal": db.query(NoteModel).filter(NoteModel.priority == "normal").count(),
        "low": db.query(NoteModel).filter(NoteModel.priority == "low").count(),
    }

    return {
        "total": total,
        "done": done,
        "pending": pending,
        "by_priority": by_priority,
    }


def search_notes(db: Session, term: str) -> List[NoteModel]:
    """
    Search notes by case-insensitive match in title or content.
    Returns list of matching NoteModel.
    """
    term = term.strip().lower()
    if not term:
        return []
    return (
        db.query(NoteModel)
        .filter(
            or_(
                func.lower(NoteModel.title).contains(term),
                func.lower(NoteModel.content).contains(term),
            )
        )
        .order_by(NoteModel.id)
        .all()
    )
