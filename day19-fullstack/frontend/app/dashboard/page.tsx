"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import type { Note, StatsResponse } from "@/lib/types";
import { NoteModal } from "@/components/NoteModal";
import { Toast } from "@/components/Toast";

type FilterType = "all" | "high" | "normal" | "low" | "done" | "pending";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function NoteCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-slate-900 p-4">
      <div className="mb-2 h-4 w-3/4 rounded bg-slate-700" />
      <div className="mb-2 h-3 w-full rounded bg-slate-700" />
      <div className="mb-2 h-3 w-5/6 rounded bg-slate-700" />
      <div className="h-3 w-1/2 rounded bg-slate-700" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [toast, setToast] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [statsRes, notesRes] = await Promise.all([
        api.notes.stats(),
        api.notes.getAll({
          limit: 100,
          ...(filter !== "all" && filter !== "done" && filter !== "pending"
            ? { priority: filter }
            : {}),
          ...(filter === "done" ? { status: "done" } : {}),
          ...(filter === "pending" ? { status: "pending" } : {}),
        }),
      ]);
      setStats(statsRes);
      setNotes(notesRes.notes);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filter, showToast]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    fetchData();
  }, [authLoading, isAuthenticated, router, fetchData]);

  const filteredNotes = search.trim()
    ? notes.filter((n) =>
        n.title.toLowerCase().includes(search.trim().toLowerCase())
      )
    : notes;

  const handleMarkDone = async (note: Note) => {
    setActionLoading(note.id);
    try {
      await api.notes.update(note.id, { done: !note.done });
      fetchData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (note: Note) => {
    if (!confirm("Delete this note?")) return;
    setActionLoading(note.id);
    try {
      await api.notes.delete(note.id);
      fetchData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (note: Note) => {
    setEditNote(note);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditNote(null);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-slate-300" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const name = user?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-2xl font-semibold text-slate-100">
          {getGreeting()}, {name}! 👋
        </h1>

        {/* Stats row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {loading ? (
            <>
              <NoteCardSkeleton />
              <NoteCardSkeleton />
              <NoteCardSkeleton />
              <NoteCardSkeleton />
            </>
          ) : stats ? (
            <>
              <StatCard label="Total Notes" value={stats.total} />
              <StatCard label="Done" value={stats.done} />
              <StatCard label="Pending" value={stats.pending} />
              <StatCard label="High Priority" value={stats.by_priority.high} />
            </>
          ) : null}
        </div>

        {/* Filter bar + search + add button */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                "all",
                "high",
                "normal",
                "low",
                "done",
                "pending",
              ] as FilterType[]
            ).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                  filter === f
                    ? "bg-slate-700 text-slate-100"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            onClick={() => {
              setEditNote(null);
              setModalOpen(true);
            }}
            className="rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-100 hover:bg-slate-600"
          >
            Add Note
          </button>
        </div>

        {/* Notes grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-xl bg-slate-900 p-12 text-center text-slate-400">
            No notes yet. Create your first one! 📝
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl bg-slate-900 p-4"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-medium text-slate-100">{note.title}</h3>
                  <div className="flex shrink-0 gap-1">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        note.done
                          ? "bg-green-900/50 text-green-300"
                          : "bg-amber-900/50 text-amber-300"
                      }`}
                    >
                      {note.done ? "Done" : "Pending"}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        note.priority === "high"
                          ? "bg-red-900/50 text-red-300"
                          : note.priority === "low"
                            ? "bg-slate-700 text-slate-400"
                            : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {note.priority}
                    </span>
                  </div>
                </div>
                <p className="mb-2 line-clamp-2 text-sm text-slate-400">
                  {note.content}
                </p>
                <div className="mb-3 flex flex-wrap gap-1">
                  {note.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mb-3 text-xs text-slate-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkDone(note)}
                    disabled={actionLoading === note.id}
                    className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 disabled:opacity-50"
                    title={note.done ? "Mark pending" : "Mark done"}
                  >
                    ✓ {note.done ? "Done" : "Mark Done"}
                  </button>
                  <button
                    onClick={() => openEdit(note)}
                    disabled={actionLoading === note.id}
                    className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-600 disabled:opacity-50"
                    title="Edit"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note)}
                    disabled={actionLoading === note.id}
                    className="rounded bg-slate-700 px-2 py-1 text-xs text-red-300 hover:bg-slate-600 disabled:opacity-50"
                    title="Delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NoteModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={fetchData}
        editNote={editNote}
      />

      {toast && (
        <Toast message={toast} onDismiss={() => setToast("")} />
      )}
    </div>
  );
}
