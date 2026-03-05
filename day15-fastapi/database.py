"""
Database connection and session management for the Notes API.
Loads DATABASE_URL from .env, creates the SQLAlchemy engine and session factory,
and provides a get_db dependency for FastAPI route injection.
"""

from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

import os

# Load environment variables from .env so DATABASE_URL is available.
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env")

# Create the SQLAlchemy engine. echo=True can be enabled for SQL debugging.
engine = create_engine(DATABASE_URL, echo=False)

# SessionLocal is a factory for creating new database sessions.
# Each request gets its own session, which is closed after the request.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all SQLAlchemy table models. Used by models.py.
Base = declarative_base()


def create_tables() -> None:
    """
    Create all tables defined in the models.
    Called on application startup to ensure the schema exists.
    """
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session.
    Ensures the session is closed after the request, even if an error occurs.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
