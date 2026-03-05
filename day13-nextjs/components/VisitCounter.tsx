"use client";

import { useEffect, useState } from "react";

// Keep the visit counter on the client so we can call the API route on mount
// without impacting the rest of the server-rendered homepage.
export default function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchVisits = async () => {
      try {
        const res = await fetch("/api/visits");
        if (!res.ok) {
          throw new Error("Failed to load visit count");
        }
        const data = (await res.json()) as { count?: number };
        if (isMounted && typeof data.count === "number") {
          setCount(data.count);
        }
      } catch {
        // In case of error, leave count as null; the UI will keep a generic message.
        if (isMounted) {
          setCount(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVisits();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <p className="inline-flex items-center text-xs text-slate-400 animate-pulse">
        👁 counting visitors...
      </p>
    );
  }

  if (count == null) {
    return (
      <p className="inline-flex items-center text-xs text-slate-400">
        👁 visitor count unavailable
      </p>
    );
  }

  return (
    <p className="inline-flex items-center text-xs text-slate-400">
      👁 {count} {count === 1 ? "person has" : "people have"} visited this page
    </p>
  );
}

