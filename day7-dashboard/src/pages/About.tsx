import type { FC } from 'react'

// We keep profile content structured so it is easy to extend later
// (for example with more skills or links) without changing the layout.
const skills = [
  'Python',
  'Java',
  'Spring Boot',
  'React',
  'TypeScript',
  'Tailwind',
] as const

const About: FC = () => {
  return (
    <main className="space-y-6 md:space-y-8">
      <section className="rounded-xl border border-gray-700/60 bg-gray-800/90 px-6 py-6 shadow-lg shadow-black/40 backdrop-blur">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-lg font-semibold text-slate-900 shadow-lg shadow-cyan-500/40">
              AJ
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                Anant Jindal
              </h1>
              <p className="text-sm text-gray-400">
                Full Stack Developer — Returning &amp; Levelling Up
              </p>
            </div>
          </div>
          <a
            href="https://github.com/anantjindal1"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gray-600 bg-gray-900/70 px-4 py-2 text-sm text-gray-100 shadow-md shadow-black/40 transition hover:border-gray-400 hover:bg-gray-800"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
            <span>GitHub</span>
          </a>
        </header>

        <p className="mt-4 text-sm text-gray-300">
          After a long break away from hands‑on coding, this journey is about
          coming back with stronger fundamentals, modern tools, and a deliberate
          learning system powered by AI.
        </p>
      </section>

      <section className="rounded-xl border border-gray-700/60 bg-gray-800/90 px-6 py-5 shadow-lg shadow-black/40 backdrop-blur">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
          Core Skills
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          {skills.map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-2 rounded-lg border border-gray-700/70 bg-gray-900/70 px-3 py-2 text-sm text-gray-100"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>{skill}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-700/60 bg-gray-800/90 px-6 py-5 shadow-lg shadow-black/40 backdrop-blur">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
          Timeline
        </h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center">
              <span className="h-2 w-2 rounded-full bg-gray-500" />
              <span className="mt-1 h-10 w-px bg-gray-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-300">2015</p>
              <p className="text-xs text-gray-400">
                Paused active coding while focusing on other parts of life and
                career.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center">
              <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-300">2026</p>
              <p className="text-xs text-gray-400">
                Back with AI tools, rebuilding momentum, and treating coding as
                a long‑term craft again.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About

