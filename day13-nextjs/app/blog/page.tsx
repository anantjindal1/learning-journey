import type { Metadata } from "next";
import Link from "next/link";

// Keep posts inline in this file to simulate a lightweight CMS without introducing extra persistence yet.
const posts = [
  {
    slug: "returning-to-coding-with-ai",
    title:
      "Returning to Coding After 10 Years — How AI Changed Everything",
    date: "2026-02-26",
    excerpt:
      "I stopped coding in 2015. Here is what it felt like to come back with Cursor and Claude as my pair programmers.",
    readTime: "5 min read",
    tags: ["AI", "Vibe Coding", "Career"],
  },
  {
    slug: "vibe-coding-workflow",
    title: "My Vibe Coding Workflow — From Idea to Deployed App",
    date: "2026-02-28",
    excerpt:
      "Describe, generate, read, refine, ship. How I use Cursor to build faster than ever.",
    readTime: "4 min read",
    tags: ["Cursor", "Productivity", "React"],
  },
  {
    slug: "modern-python-2026",
    title: "Modern Python in 2026 — What Changed Since 2015",
    date: "2026-03-01",
    excerpt:
      "Dataclasses, type hints, match/case, f-strings. Python feels like a different language now.",
    readTime: "6 min read",
    tags: ["Python", "TypeScript", "Learning"],
  },
] as const;

export const metadata: Metadata = {
  title: "Blog — Anant Jindal",
};

export default function BlogPage() {
  return (
    <div className="px-4 pb-16 pt-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Blog
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Notes from my journey back into full-time development — how I use
            AI tools, what I&apos;m re-learning, and experiments along the way.
          </p>
        </header>

        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm shadow-slate-950/40 sm:p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-slate-50 sm:text-lg">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-sky-300"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {post.date} · {post.readTime}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-300">{post.excerpt}</p>
              <div className="mt-3">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-medium text-sky-400 hover:text-sky-300"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

