import type { Metadata } from "next";

// Use metadata per-page so the About route has a meaningful title in the browser and SEO.
export const metadata: Metadata = {
  title: "About — Anant Jindal",
};

export default function AboutPage() {
  const stats = [
    { label: "Years Experience", value: "5+" },
    { label: "Projects Built", value: "20+" },
    { label: "Days into Journey", value: "13" },
    { label: "Apps Deployed", value: "3" },
  ];

  const techStack = [
    { label: "Java", icon: "☕️" },
    { label: "Spring Boot", icon: "🌱" },
    { label: "Android / Compose", icon: "📱" },
    { label: "Python", icon: "🐍" },
    { label: "FastAPI", icon: "⚡️" },
    { label: "React", icon: "⚛️" },
    { label: "Next.js", icon: "▲" },
    { label: "TypeScript", icon: "📘" },
    { label: "Tailwind CSS", icon: "💨" },
    { label: "LLMs / AI Tools", icon: "🤖" },
  ];

  return (
    <div className="px-4 pb-16 pt-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-14">
        <section className="grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
          <div className="space-y-5">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              About Anant
            </h1>
            <div className="space-y-3 text-slate-200">
              <p className="text-sm sm:text-base">
                I started my career between 2010–2015 building Android apps and
                backend services with Java and Spring Boot. Most of my days
                were spent in Eclipse and Android Studio, wiring up XML layouts,
                REST APIs, and database integrations.
              </p>
              <p className="text-sm sm:text-base">
                In 2015, I stepped away from day-to-day coding. That detour
                lasted almost a decade — long enough for the ecosystem to
                reinvent itself with React, TypeScript, cloud-native tooling,
                and now AI-assisted development.
              </p>
              <p className="text-sm sm:text-base">
                In 2026, I decided to come back. Tools like Cursor and modern
                language models turn coding into a conversation again. I bring
                my old mental models, but I&apos;m deliberately rebuilding
                fundamentals: clean architecture, testing, and deeper stack
                understanding — this time with AI helping me reason, refactor,
                and ship faster.
              </p>
            </div>
          </div>

          <aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm shadow-slate-950/40">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Snapshot
            </h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3"
                >
                  <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-slate-50">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </section>

        <section className="space-y-5">
          <h2 className="text-lg font-semibold sm:text-xl">Timeline</h2>
          <ol className="relative space-y-6 border-l border-slate-800 pl-5">
            <li className="relative">
              <span className="absolute -left-[9px] top-1 h-2 w-2 rounded-full bg-sky-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                2010–2015
              </p>
              <p className="mt-2 text-sm font-medium text-slate-100">
                Software Developer — Android, Java, Spring Boot
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Built Android apps, REST APIs, and backend services. Most work
                lived in Java, XML layouts, and server-side architectures.
              </p>
            </li>
            <li className="relative">
              <span className="absolute -left-[9px] top-1 h-2 w-2 rounded-full bg-slate-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                2015–2025
              </p>
              <p className="mt-2 text-sm font-medium text-slate-100">
                Career pivot — away from coding
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Focused on roles outside of software engineering, but kept a
                curiosity for how the industry evolved — cloud, mobile, and now
                AI.
              </p>
            </li>
            <li className="relative">
              <span className="absolute -left-[9px] top-1 h-2 w-2 rounded-full bg-emerald-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                2026
              </p>
              <p className="mt-2 text-sm font-medium text-slate-100">
                Return to development — AI-assisted workflow
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Re-learning the modern stack with AI tools as constant
                pair-programmers. This portfolio and blog document that journey
                in public.
              </p>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold sm:text-xl">Tech Stack</h2>
          {/* Use a simple responsive grid instead of a tag cloud so the stack stays scannable. */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((tech) => (
              <div
                key={tech.label}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
              >
                <span className="text-lg">{tech.icon}</span>
                <span>{tech.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

