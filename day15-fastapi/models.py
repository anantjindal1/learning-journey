"""
SQLAlchemy table models for the Notes API.
Defines the notes table schema as used in PostgreSQL.
"""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


def utcnow() -> datetime:
    """Return current UTC time for column defaults."""
    return datetime.now(timezone.utc)


class NoteModel(Base):
    """
    SQLAlchemy model for the notes table.
    Maps to a single row in PostgreSQL.
    """

    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(String(5000), nullable=False)
    priority: Mapped[str] = mapped_column(String(10), default="normal", nullable=False)
    done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Tags stored as comma-separated string for simplicity (e.g. "work,meetings,urgent").
    tags: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )
