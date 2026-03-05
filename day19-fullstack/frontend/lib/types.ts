/**
 * Shared types for the Notes app frontend.
 * Matches FastAPI backend schemas (schemas.py).
 */

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  priority: "high" | "normal" | "low";
  done: boolean;
  tags: string[];
  created_at: string;
  updated_at?: string; // Optional: backend returns it
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface StatsResponse {
  total: number;
  done: number;
  pending: number;
  by_priority: { high: number; normal: number; low: number };
}
