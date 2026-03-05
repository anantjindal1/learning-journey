import Link from "next/link";
import WeatherWidget from "../components/WeatherWidget";
import VisitCounter from "../components/VisitCounter";

// Use a server component for the homepage so it can stay lightweight and ready for server-side data fetching like the weather widget,
// while small client islands (weather, visit counter) handle focused bits of interactivity and dynamic data.
export default function Home() {
  const learningItems = [
    "TypeScript",
    "Next.js 14 App Router",
    "Tailwind CSS",
    "FastAPI",
    "LLM Integrations",
    "Jetpack Compose",
    "Clean Architecture",
  ];

  const blogPreviews = [
    {
      slug: "returning-to-coding-with-ai",
      title:
        "Returning to Coding After 10 Years — How AI Changed Everything",
      date: "2026-02-26",
      excerpt:
        "From Android and Spring Boot in 2015 to AI-assisted development in 2026 — what the comeback felt like.",
    },
    {
      slug: "vibe-coding-workflow",
      title: "My Vibe Coding Workflow — From Idea to Deployed App",
      date: "2026-02-28",
      excerpt:
        "Leaning into Cursor, agents, and rapid feedback loops to ship more experiments.",
    },
    {
      slug: "modern-python-2026",
      title: "Modern Python in 2026 — What Changed Since 2015",
      date: "2026-03-01",
      excerpt:
        "Type hints, async, and modern tooling that make Python feel brand new.",
    },
  ];

  return (
    <div className="px-4 pb-16 pt-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-16">
        {/* HERO */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700/80">
              <span className="mr-2 h-2 w-2 rounded-full bg-emerald-400" />
              Back to building — with AI as a copilot
            </p>
            <div className="space-y-3">
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Hi, I&apos;m Anant 👋
              </h1>
              <p className="text-balance text-lg text-slate-300 sm:text-xl">
                Full Stack Developer rediscovering the craft with AI tools —{" "}
                blending a decade of experience with a brand new workflow.
              </p>
            </div>
            <WeatherWidget />
            <VisitCounter />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/projects"
                className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-sky-400 sm:w-auto"
              >
                View Projects
              </Link>
              <Link
                href="/blog"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900 sm:w-auto"
              >
                Read Blog
              </Link>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg shadow-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Snapshot
            </p>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                Previously: Android, Java, Spring Boot. Now: TypeScript, React,
                Python, and AI-assisted builders.
              </p>
              <p>
                This site is a living log of that journey — projects, notes,
                experiments, and lessons learned while pairing with tools like
                Cursor.
              </p>
            </div>
          </div>
        </section>

        {/* WHAT I'M BUILDING */}
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold sm:text-2xl">
              What I&apos;m Building
            </h2>
            <p className="hidden text-sm text-slate-400 sm:block">
              Small, focused projects to rebuild fluency across the stack.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-sky-500/70 hover:shadow-sky-900/40">
              <div className="mb-3 text-2xl">🐍</div>
              <h3 className="mb-2 text-base font-semibold">
                Python &amp; AI
              </h3>
              <p className="text-sm text-slate-300">
                Modern Python with FastAPI, async patterns, and LLM
                integrations for tooling and assistants.
              </p>
            </article>

            <article className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-sky-500/70 hover:shadow-sky-900/40">
              <div className="mb-3 text-2xl">⚛️</div>
              <h3 className="mb-2 text-base font-semibold">
                React &amp; Next.js
              </h3>
              <p className="text-sm text-slate-300">
                Full stack web apps in TypeScript using the App Router, server
                components, and edge-friendly APIs.
              </p>
            </article>

            <article className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-sky-500/70 hover:shadow-sky-900/40">
              <div className="mb-3 text-2xl">📱</div>
              <h3 className="mb-2 text-base font-semibold">Android</h3>
              <p className="text-sm text-slate-300">
                Reconnecting with mobile via Jetpack Compose, Kotlin, and a
                modern Android toolchain.
              </p>
            </article>
          </div>
        </section>

        {/* LATEST FROM THE BLOG */}
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold sm:text-2xl">
              Latest from the Blog
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-sky-400 hover:text-sky-300"
            >
              View all posts
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogPreviews.map((post) => (
              <article
                key={post.slug}
                className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-sm shadow-slate-950/40"
              >
                <p className="text-xs text-slate-400">{post.date}</p>
                <h3 className="mt-2 text-sm font-semibold text-slate-50">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-xs text-slate-300">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex text-xs font-medium text-sky-400 hover:text-sky-300"
                  >
                    Read more
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CURRENTLY LEARNING TICKER */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Currently Learning
            </h2>
          </div>
          {/* Use a simple CSS-powered marquee so the ticker stays smooth without extra JS. */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 py-3">
            <div className="animate-marquee flex min-w-full gap-3 whitespace-nowrap">
              {learningItems.concat(learningItems).map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex items-center rounded-full bg-slate-800 px-4 py-1 text-xs font-medium text-slate-100 ring-1 ring-slate-700/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
