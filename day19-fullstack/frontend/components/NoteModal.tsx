"use client";

/**
 * Modal for creating or editing a note.
 * Validates title and content required. Tags as comma-separated input.
 */

import { useEffect, useState } from "react";
import type { Note } from "@/lib/types";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editNote?: Note | null;
}

export function NoteModal({
  isOpen,
  onClose,
  onSuccess,
  editNote,
}: NoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"high" | "normal" | "low">("normal");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEdit = !!editNote;

  useEffect(() => {
    if (isOpen) {
      if (editNote) {
        setTitle(editNote.title);
        setContent(editNote.content);
        setPriority(editNote.priority);
        setTagsInput(editNote.tags.join(", "));
      } else {
        setTitle("");
        setContent("");
        setPriority("normal");
        setTagsInput("");
      }
      setError("");
    }
  }, [isOpen, editNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const t = title.trim();
    const c = content.trim();
    if (!t) {
      setError("Title is required");
      return;
    }
    if (!c) {
      setError("Content is required");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const { api } = await import("@/lib/api");
      if (isEdit) {
        await api.notes.update(editNote.id, {
          title: t,
          content: c,
          priority,
          tags,
        });
      } else {
        await api.notes.create({ title: t, content: c, priority, tags });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold text-slate-100">
          {isEdit ? "Edit Note" : "Add Note"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="modal-title"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Title
            </label>
            <input
              id="modal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Note title"
            />
          </div>
          <div>
            <label
              htmlFor="modal-content"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Content
            </label>
            <textarea
              id="modal-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Note content"
            />
          </div>
          <div>
            <label
              htmlFor="modal-priority"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Priority
            </label>
            <select
              id="modal-priority"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "high" | "normal" | "low")
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="modal-tags"
              className="mb-1 block text-sm font-medium text-slate-300"
            >
              Tags (comma separated)
            </label>
            <input
              id="modal-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="work, ideas, shopping"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-100 hover:bg-slate-600 disabled:opacity-50"
            >
              {submitting ? "Saving…" : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
