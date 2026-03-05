"""
Streaming AI Assistant - FastAPI backend with Groq integration.
Loads GROQ_API_KEY from .env and exposes streaming + non-streaming chat endpoints.
"""

import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from groq import Groq
from pydantic import BaseModel

# Load environment variables from .env (GROQ_API_KEY)
load_dotenv()

app = FastAPI(title="Streaming AI Assistant")

# CORS middleware for frontend requests (e.g., from different ports during dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client - uses GROQ_API_KEY from environment
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Mount static files (serves static/index.html via /static/)
app.mount("/static", StaticFiles(directory="static"), name="static")


class ChatRequest(BaseModel):
    """Request body for chat endpoints."""

    message: str
    history: list = []
    system: str = "You are a helpful productivity assistant."


def stream_groq(request: ChatRequest):
    """
    Generator that streams Groq chat completion as Server-Sent Events (SSE).
    Yields 'data: {"token": "..."}' for each token, then 'data: {"done": true}'.
    On error, yields 'data: {"error": "..."}'.
    """
    try:
        # Build messages: system + history + new user message
        messages = [{"role": "system", "content": request.system}]
        for msg in request.history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": request.message})

        # Stream from Groq - llama-3.1-8b-instant is fast for streaming
        stream = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            stream=True,
        )

        for chunk in stream:
            token = chunk.choices[0].delta.content if chunk.choices else None
            if token is not None:
                yield f"data: {json.dumps({'token': token})}\n\n"

        # Signal completion
        yield f"data: {json.dumps({'done': True})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@app.get("/")
def root():
    """Serve the main chat UI."""
    return FileResponse("static/index.html")


@app.post("/chat/stream")
def chat_stream(request: ChatRequest):
    """Stream chat response as Server-Sent Events."""
    return StreamingResponse(
        stream_groq(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/chat")
def chat(request: ChatRequest):
    """Non-streaming chat for comparison. Returns full response + token count."""
    messages = [{"role": "system", "content": request.system}]
    for msg in request.history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": request.message})

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
    )

    text = completion.choices[0].message.content
    tokens_used = completion.usage.total_tokens if completion.usage else 0

    return {"response": text, "tokens_used": tokens_used}


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok", "streaming": True}
