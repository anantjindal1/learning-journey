# Company Knowledge Base RAG API

A RAG (Retrieval Augmented Generation) API that answers questions from internal company documents using semantic search and Groq's LLM.

## Setup

1. Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and add your Groq API key:

```bash
cp .env.example .env
# Edit .env and set GROQ_API_KEY=your_key_from_console.groq.com
```

3. Run the API:

```bash
uvicorn main:app --reload --port 8000
```

Or: `python main.py`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check, documents count, model info |
| GET | `/documents` | List all documents (id, category, title) |
| GET | `/categories` | List unique categories |
| POST | `/ask` | Ask a question (searches all docs) |
| POST | `/ask/category` | Ask a question (filter by category) |
| POST | `/index/add` | Add a new document to the knowledge base |

## Example Requests

**Ask a question:**
```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How many vacation days do I get?"}'
```

**Ask with category filter (HR only):**
```bash
curl -X POST http://localhost:8000/ask/category \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the WFH policy?", "category": "HR"}'
```

## Tech Stack

- **FastAPI** – Web framework
- **ChromaDB** – Vector store for semantic search
- **SentenceTransformers** – Embeddings (all-MiniLM-L6-v2)
- **Groq** – LLM (llama-3.1-8b-instant)
