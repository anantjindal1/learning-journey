"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

/**
 * Navbar shown when authenticated: logo, Dashboard link, user avatar, Logout.
 */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-slate-100 hover:text-white"
        >
          📝 NoteAI
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-white"
          >
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-sm font-medium text-slate-200"
              title={user.email}
            >
              {getInitials(user.full_name)}
            </span>
            <span className="text-sm text-slate-400">{user.full_name}</span>
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
