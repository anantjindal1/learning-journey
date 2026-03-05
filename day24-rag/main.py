"""
RAG (Retrieval Augmented Generation) API - Company Knowledge Base Chatbot

RAG combines two key ideas:
1. RETRIEVAL: Find relevant documents from a knowledge base using semantic search
   (embeddings turn text into vectors; similar meaning = similar vectors = nearby in space)
2. AUGMENTED GENERATION: Feed those retrieved docs as context to an LLM so it can
   answer questions grounded in your actual data, not just its training

This prevents "hallucination" - the LLM can only cite what's in your documents.
"""

import os
from pathlib import Path
from typing import Optional

import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel

# Load .env from the same directory as this file (not CWD - uvicorn may run from elsewhere)
load_dotenv(Path(__file__).resolve().parent / ".env")

# =============================================================================
# IN-MEMORY VECTOR STORE (ChromaDB-compatible API)
# =============================================================================
# ChromaDB 0.3.x has Pydantic v2 compatibility issues (_client PrivateAttr).
# This lightweight store provides the same add/query interface using numpy.
# Uses L2 distance for nearest-neighbor search (same as ChromaDB default).


class InMemoryVectorStore:
    """ChromaDB-compatible in-memory vector store. No Pydantic/ChromaDB deps."""

    def __init__(self):
        self.ids: list[str] = []
        self.documents: list[str] = []
        self.embeddings: list[list[float]] = []
        self.metadatas: list[dict] = []

    def add(
        self,
        ids: list[str],
        documents: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict],
    ) -> None:
        for i, doc_id in enumerate(ids):
            if doc_id in self.ids:
                idx = self.ids.index(doc_id)
                self.documents[idx] = documents[i]
                self.embeddings[idx] = embeddings[i]
                self.metadatas[idx] = metadatas[i]
            else:
                self.ids.append(doc_id)
                self.documents.append(documents[i])
                self.embeddings.append(embeddings[i])
                self.metadatas.append(metadatas[i])

    def query(
        self,
        query_embeddings: list[list[float]],
        n_results: int = 10,
        where: Optional[dict] = None,
        include: Optional[list[str]] = None,
    ) -> dict:
        include = include or ["documents", "metadatas", "distances"]
        # Filter by metadata (e.g. where={"category": "HR"})
        indices = list(range(len(self.ids)))
        if where:
            indices = [
                i for i in indices
                if all(self.metadatas[i].get(k) == v for k, v in where.items())
            ]
        if not indices:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

        emb = np.array([self.embeddings[i] for i in indices], dtype=np.float32)
        q = np.array(query_embeddings[0], dtype=np.float32)
        # L2 distance (ChromaDB default)
        dists = np.linalg.norm(emb - q, axis=1)
        top_k = min(n_results, len(indices))
        order = np.argsort(dists)[:top_k]

        result_ids = [[self.ids[indices[i]] for i in order]]
        result_docs = [[self.documents[indices[i]] for i in order]] if "documents" in include else [[]]
        result_meta = [[self.metadatas[indices[i]] for i in order]] if "metadatas" in include else [[]]
        result_dists = [[float(dists[i]) for i in order]] if "distances" in include else [[]]

        return {
            "ids": result_ids,
            "documents": result_docs,
            "metadatas": result_meta,
            "distances": result_dists,
        }


# =============================================================================
# MODULE-LEVEL INITIALIZATION
# =============================================================================
# These are loaded once at startup for efficiency - embedding models are
# expensive to create repeatedly.

# Strip whitespace from key (common .env gotcha). Use placeholder if missing.
_api_key = (os.getenv("GROQ_API_KEY") or "").strip()
groq_client = Groq(api_key=_api_key or "placeholder")
# SentenceTransformer converts text → vector (embedding). all-MiniLM-L6-v2 is
# fast and good for semantic similarity - "vacation policy" matches "PTO rules"
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
# In-memory vector store - ChromaDB-compatible API, no Pydantic issues
collection = InMemoryVectorStore()
# Track whether we've loaded docs - avoids re-indexing on every request
indexed = False

# =============================================================================
# COMPANY DOCUMENTS (hardcoded knowledge base)
# =============================================================================
documents = [
    {
        "id": "hr-001",
        "category": "HR",
        "title": "Vacation Policy",
        "content": "Employees receive 20 days paid vacation per year. Vacation days accrue at 1.67 days per month. Unused vacation can be carried over up to 10 days to the next year. Vacation requests must be submitted 2 weeks in advance through the HR portal. Vacation during product launches or quarterly reviews requires manager approval.",
    },
    {
        "id": "hr-002",
        "category": "HR",
        "title": "Work From Home Policy",
        "content": "Employees may work from home up to 3 days per week. Core hours are 10am-4pm in the employee's local timezone. All remote work must be approved by direct manager. Employees need a dedicated workspace with reliable internet. Company laptop must be used for all work. VPN is required when accessing company systems remotely.",
    },
    {
        "id": "product-001",
        "category": "Product",
        "title": "Refund Policy",
        "content": "Customers can request refunds within 30 days of purchase. Refunds are processed within 5-7 business days. Digital products are non-refundable after download. Subscription cancellations take effect at the end of the current billing period. Partial refunds are available for annual subscriptions cancelled after 30 days. Contact billing@company.com for refund requests.",
    },
    {
        "id": "product-002",
        "category": "Product",
        "title": "Pricing Tiers",
        "content": "Starter plan is free with up to 3 projects and 1GB storage. Pro plan is $29/month with unlimited projects and 50GB storage. Enterprise plan is $99/month with unlimited everything plus SSO, audit logs, and dedicated support. Annual billing provides 20% discount. All plans include 14-day free trial. Student discount of 50% available with valid .edu email.",
    },
    {
        "id": "eng-001",
        "category": "Engineering",
        "title": "Deployment Process",
        "content": "All code must be reviewed by at least 2 engineers before merging. Deployments happen every Tuesday and Thursday at 2pm UTC. Emergency hotfixes require VP Engineering approval. All deployments must pass CI/CD pipeline including unit tests, integration tests, and security scan. Rollback procedure: revert commit and redeploy within 15 minutes. Post-deployment monitoring required for 1 hour.",
    },
    {
        "id": "eng-002",
        "category": "Engineering",
        "title": "On-Call Rotation",
        "content": "On-call rotation is weekly, rotating through senior engineers. On-call engineer must respond to P1 incidents within 15 minutes. P2 incidents require response within 1 hour. On-call compensation is $200 per week plus $50 per incident responded to. Schedule managed in PagerDuty. Escalation path: on-call engineer → team lead → VP Engineering → CTO.",
    },
    {
        "id": "sales-001",
        "category": "Sales",
        "title": "Discount Authority",
        "content": "Sales reps can offer up to 10% discount without approval. Discounts of 11-20% require sales manager approval. Discounts above 20% require VP Sales approval. Discounts above 30% require CEO approval. All discounts must be logged in Salesforce. Competitive discounts (when replacing a competitor) can be up to 25% with manager approval.",
    },
    {
        "id": "sales-002",
        "category": "Sales",
        "title": "Commission Structure",
        "content": "Base commission is 8% of closed deal value. Accelerator kicks in at 100% quota: commission increases to 12%. At 150% quota commission increases to 15%. Enterprise deals (over $50k ARR) have 10% base commission. Commissions are paid monthly, 30 days after deal closes. Clawback policy: if customer churns within 90 days, 50% of commission is clawed back.",
    },
]


def index_documents() -> None:
    """
    Index all documents into the vector store for semantic search.

    RAG Step 0 (offline): For each document, we:
    1. Convert its text to a vector (embedding) - captures semantic meaning
    2. Store the vector + metadata in the vector store
    Later, when a user asks a question, we embed the question and find the
    nearest document vectors - those are the most relevant docs.
    """
    global indexed
    for doc in documents:
        # Encode: text → 384-dim vector. Similar content = similar vectors.
        embedding = embedding_model.encode(doc["content"]).tolist()
        collection.add(
            ids=[doc["id"]],
            documents=[doc["content"]],
            embeddings=[embedding],
            metadatas=[
                {"id": doc["id"], "category": doc["category"], "title": doc["title"]}
            ],
        )
    indexed = True


def retrieve(query: str, n_results: int = 3, category: Optional[str] = None) -> list[dict]:
    """
    Retrieve the most relevant documents for a query (RAG retrieval step).

    We embed the query, then search the vector store: "which stored vectors are closest?"
    Uses L2 distance for nearest-neighbor search. Lower distance = more semantically similar.
    """
    query_embedding = embedding_model.encode(query).tolist()
    # where filter restricts to a category (e.g. "only HR docs")
    where_filter = {"category": category} if category else None
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where=where_filter,
        include=["documents", "metadatas", "distances"],
    )
    # Vector store returns lists-of-lists (supports batch queries); we have 1 query
    docs = results.get("documents", [[]])[0] or []
    metadatas = results.get("metadatas", [[]])[0] or []
    distances = results.get("distances", [[]])[0] or []
    return [
        {
            "content": doc,
            "title": meta.get("title", ""),
            "category": meta.get("category", ""),
            "distance": dist,
        }
        for doc, meta, dist in zip(docs, metadatas, distances)
    ]


# =============================================================================
# FASTAPI APP
# =============================================================================
app = FastAPI(title="Company Knowledge Base RAG API")

# CORS: allow frontend (e.g. localhost:3000) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/response models
class AskRequest(BaseModel):
    question: str


class AskCategoryRequest(BaseModel):
    question: str
    category: str


class IndexAddRequest(BaseModel):
    id: str
    category: str
    title: str
    content: str


# =============================================================================
# STARTUP: Index documents on server start
# =============================================================================
@app.on_event("startup")
def startup_event():
    index_documents()


# =============================================================================
# ENDPOINTS
# =============================================================================

@app.get("/health")
def health():
    """Health check - confirms API is up and docs are indexed."""
    return {
        "status": "ok",
        "documents_indexed": len(documents),
        "model": "llama-3.1-8b-instant",
    }


@app.get("/documents")
def list_documents():
    """List all documents (id, category, title) - no full content."""
    return [
        {"id": d["id"], "category": d["category"], "title": d["title"]}
        for d in documents
    ]


@app.post("/ask")
def ask(req: AskRequest):
    """
    RAG pipeline: retrieve relevant docs → build context → LLM answers.

    The LLM is instructed to answer ONLY from the provided context. This
    grounds the answer in your docs and reduces hallucination.
    """
    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="question is required")

    # Step 1: Retrieve top 3 most relevant documents
    relevant = retrieve(question, n_results=3)

    # Step 2: Build context string for the LLM
    context = "\n\n".join(
        [f"[{doc['title']}]\n{doc['content']}" for doc in relevant]
    )

    # Step 3: Call Groq LLM with context (augmented generation)
    prompt = f"""You are a helpful company assistant.
Answer the question based ONLY on the provided company documents.
If the answer is not in the documents, say "I don't have information about that in our company docs."

COMPANY DOCUMENTS:
{context}

QUESTION: {question}

Answer concisely and cite which document(s) you used."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,  # Lower = more deterministic, less creative
        )
        ai_response = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"LLM service error: {str(e)}. Check GROQ_API_KEY in .env.",
        )

    return {
        "question": question,
        "answer": ai_response,
        "sources": [
            {"title": doc["title"], "category": doc["category"]} for doc in relevant
        ],
        "retrieved_count": len(relevant),
    }


@app.post("/ask/category")
def ask_category(req: AskCategoryRequest):
    """
    Same as /ask but restricts retrieval to a specific category.
    E.g. "only search HR docs" or "only search Engineering docs".
    """
    question = req.question.strip()
    category = req.category.strip()
    if not question:
        raise HTTPException(status_code=400, detail="question is required")
    if not category:
        raise HTTPException(status_code=400, detail="category is required")

    relevant = retrieve(question, n_results=3, category=category)

    context = "\n\n".join(
        [f"[{doc['title']}]\n{doc['content']}" for doc in relevant]
    )

    prompt = f"""You are a helpful company assistant.
Answer the question based ONLY on the provided company documents.
If the answer is not in the documents, say "I don't have information about that in our company docs."

COMPANY DOCUMENTS:
{context}

QUESTION: {question}

Answer concisely and cite which document(s) you used."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        ai_response = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"LLM service error: {str(e)}. Check GROQ_API_KEY in .env.",
        )

    return {
        "question": question,
        "answer": ai_response,
        "sources": [
            {"title": doc["title"], "category": doc["category"]} for doc in relevant
        ],
        "retrieved_count": len(relevant),
    }


@app.get("/categories")
def list_categories():
    """Return unique categories from the document set."""
    return list({d["category"] for d in documents})


@app.post("/index/add")
def index_add(req: IndexAddRequest):
    """Add a new document to both the in-memory list and vector store."""
    doc = {
        "id": req.id,
        "category": req.category,
        "title": req.title,
        "content": req.content,
    }
    documents.append(doc)
    embedding = embedding_model.encode(doc["content"]).tolist()
    collection.add(
        ids=[doc["id"]],
        documents=[doc["content"]],
        embeddings=[embedding],
        metadatas=[
            {"id": doc["id"], "category": doc["category"], "title": doc["title"]}
        ],
    )
    return {"message": "Document indexed", "id": req.id, "title": req.title}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
