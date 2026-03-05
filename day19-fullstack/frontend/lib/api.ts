/**
 * API client for the Notes FastAPI backend.
 * Handles auth headers, 401 redirect, and typed endpoints.
 */

import type { Note, StatsResponse, TokenResponse, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "notes_token";

/** Read JWT from localStorage. Only safe in browser (client components). */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Store token after login/register. */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

/** Clear token on logout or 401. */
export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

/** Handle 401: clear token and redirect to login. */
function handle401(): void {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

type RequestInitWithBody = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * Fetch wrapper that adds Authorization header and handles 401.
 * For JSON bodies, pass body as object; for FormData, pass FormData directly.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInitWithBody = {}
): Promise<T> {
  const { body, ...rest } = options;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let finalBody: BodyInit | undefined;
  if (body !== undefined) {
    if (body instanceof FormData) {
      finalBody = body;
      // Don't set Content-Type for FormData; browser sets it with boundary
    } else {
      headers["Content-Type"] = "application/json";
      finalBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string>) },
    body: finalBody,
  });

  if (res.status === 401) {
    handle401();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const detail = errData.detail ?? errData.error ?? res.statusText;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// -----------------------------------------------------------------------------
// Auth API
// -----------------------------------------------------------------------------

export const api = {
  auth: {
    /** Login with email/password. Backend expects OAuth2 form: username=email. */
    async login(email: string, password: string): Promise<TokenResponse> {
      const form = new FormData();
      form.append("username", email);
      form.append("password", password);
      return apiFetch<TokenResponse>("/auth/login", {
        method: "POST",
        body: form,
      });
    },

    /** Register new user. Returns token for auto-login. */
    async register(
      email: string,
      password: string,
      full_name: string
    ): Promise<TokenResponse> {
      return apiFetch<TokenResponse>("/auth/register", {
        method: "POST",
        body: { email, password, full_name },
      });
    },

    /** Get current user. Requires valid token. */
    async me(): Promise<User> {
      return apiFetch<User>("/auth/me");
    },
  },

  notes: {
    /** List notes with optional filters. */
    async getAll(params?: {
      priority?: "high" | "normal" | "low";
      status?: "done" | "pending";
      tag?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ notes: Note[]; total: number; limit: number; offset: number }> {
      const search = new URLSearchParams();
      if (params?.priority) search.set("priority", params.priority);
      if (params?.status) search.set("status", params.status);
      if (params?.tag) search.set("tag", params.tag);
      if (params?.limit) search.set("limit", String(params.limit));
      if (params?.offset) search.set("offset", String(params.offset));
      const qs = search.toString();
      return apiFetch(`/notes${qs ? `?${qs}` : ""}`);
    },

    /** Get single note by id. */
    async getOne(id: number): Promise<Note> {
      return apiFetch<Note>(`/notes/${id}`);
    },

    /** Create new note. */
    async create(data: {
      title: string;
      content: string;
      priority?: "high" | "normal" | "low";
      tags?: string[];
    }): Promise<Note> {
      return apiFetch<Note>("/notes", {
        method: "POST",
        body: {
          title: data.title.trim(),
          content: data.content.trim(),
          priority: data.priority ?? "normal",
          tags: data.tags ?? [],
        },
      });
    },

    /** Update note (partial). */
    async update(
      id: number,
      data: Partial<{
        title: string;
        content: string;
        priority: "high" | "normal" | "low";
        done: boolean;
        tags: string[];
      }>
    ): Promise<Note> {
      return apiFetch<Note>(`/notes/${id}`, {
        method: "PATCH",
        body: data,
      });
    },

    /** Delete note. */
    async delete(id: number): Promise<void> {
      return apiFetch(`/notes/${id}`, { method: "DELETE" });
    },

    /** Get stats for dashboard. */
    async stats(): Promise<StatsResponse> {
      return apiFetch<StatsResponse>("/notes/stats");
    },
  },
};
