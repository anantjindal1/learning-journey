"""
Pydantic schemas for request/response validation in the Notes API.
Keeps API contracts separate from database models.
"""

from typing import Any, List, Optional

from pydantic import BaseModel, EmailStr, Field, computed_field, field_validator


def _validate_tags(tags: List[str]) -> List[str]:
    """
    Normalize tags: lowercase, strip whitespace, remove duplicates.
    Enforces max 10 tags. Used by NoteCreate and NoteUpdate.
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


# -----------------------------------------------------------------------------
# Enums
# -----------------------------------------------------------------------------

from enum import Enum


class PriorityEnum(str, Enum):
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
# Request/Response schemas
# -----------------------------------------------------------------------------


class NoteCreate(BaseModel):
    """Payload for creating a new note. Server assigns id, done, timestamps."""

    title: str = Field(..., min_length=1, max_length=100, description="Note title")
    content: str = Field(..., min_length=1, max_length=5000, description="Note content")
    priority: PriorityEnum = Field(
        default=PriorityEnum.NORMAL,
        description="Note priority",
    )
    tags: List[str] = Field(
        default_factory=list,
        max_length=10,
        description="Up to 10 tags",
    )

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
    priority: Optional[PriorityEnum] = None
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
    """
    Full note as returned by the API.
    Includes computed preview and ISO timestamps.
    Tags can be passed as comma-separated string (from DB) or list; validator normalizes to list.
    """

    id: int
    title: str
    content: str
    priority: str
    done: bool
    tags: List[str]
    created_at: str
    updated_at: str

    @field_validator("tags", mode="before")
    @classmethod
    def tags_from_comma_separated(cls, v: Any) -> List[str]:
        """
        Convert comma-separated tags string (from DB) to list[str].
        Also accepts list input for flexibility.
        """
        if v is None:
            return []
        if isinstance(v, list):
            return [str(t).strip() for t in v if str(t).strip()]
        if isinstance(v, str):
            if not v.strip():
                return []
            return [t.strip() for t in v.split(",") if t.strip()]
        raise ValueError("Tags must be a string or list")

    @computed_field
    @property
    def preview(self) -> str:
        """First 100 characters of content, with '...' if truncated."""
        if len(self.content) <= 100:
            return self.content
        return self.content[:100] + "..."

    model_config = {"from_attributes": True}


class NoteListResponse(BaseModel):
    """Paginated list of notes with metadata."""

    notes: List[NoteResponse]
    total: int
    limit: int
    offset: int


class StatsResponse(BaseModel):
    """Business metrics for the notes collection."""

    total: int
    done: int
    pending: int
    by_priority: dict


# -----------------------------------------------------------------------------
# Auth schemas
# -----------------------------------------------------------------------------


class UserCreate(BaseModel):
    """Payload for user registration."""

    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=8, description="Password (min 8 chars)")
    full_name: str = Field(..., min_length=2, description="Display name (min 2 chars)")

class UserResponse(BaseModel):
    """User data returned by API. Never includes password."""

    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    """Payload for login (alternative to OAuth2PasswordRequestForm)."""

    email: str
    password: str


class TokenResponse(BaseModel):
    """OAuth2 token response with user info."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
