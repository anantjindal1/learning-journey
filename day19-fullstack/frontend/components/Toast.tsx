"use client";

/**
 * Simple toast for error messages. Fixed bottom-right, auto-dismiss after 4s.
 */

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 rounded-lg bg-red-900/95 px-4 py-3 text-red-100 shadow-lg"
      role="alert"
    >
      {message}
    </div>
  );
}
