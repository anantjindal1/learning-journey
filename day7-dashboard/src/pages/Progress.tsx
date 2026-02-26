import type { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const TOTAL_DAYS = 42
const COMPLETED_DAYS = 7
const TODAY_DAY = 8

// We keep the 42‑day grid purely presentational and derive styles from the
// day index so it stays easy to tweak the “completed” and “today” states,
// while also honouring an optional weekId route param for deep links.
const Progress: FC = () => {
  const days = Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1)

  const navigate = useNavigate()
  const { weekId } = useParams()
  const activeWeekIndex =
    weekId != null && !Number.isNaN(Number.parseInt(weekId, 10))
      ? Math.max(0, Math.min(5, Number.parseInt(weekId, 10) - 1))
      : 0

  const weekSummaries = [
    {
      label: 'Week 1 · Foundations',
      description:
        'Rebooted coding habit, set up environment, built this personal dashboard.',
    },
    {
      label: 'Week 2 · Frontend Focus',
      description:
        'Deep dive into modern React, TypeScript, and Tailwind patterns.',
    },
    {
      label: 'Week 3 · Backend & APIs',
      description:
        'Refreshed Java/Spring Boot skills and explored clean API design.',
    },
    {
      label: 'Week 4 · End‑to‑End Shipping',
      description:
        'Polished flows, added automation, and leaned on AI tools effectively.',
    },
    {
      label: 'Week 5 · Advanced Topics',
      description: 'Experimented with performance, testing, and architecture.',
    },
    {
      label: 'Week 6 · Reflection',
      description:
        'Reviewed learnings and planned the next phase of the journey.',
    },
  ]

  return (
    <main className="space-y-6 md:space-y-8">
      <section className="rounded-xl border border-gray-700/60 bg-gray-800/90 px-6 py-5 shadow-lg shadow-black/40 backdrop-blur">
        <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              42‑Day Learning Tracker
            </h1>
            <p className="text-sm text-gray-400">
              A GitHub‑style streak view for this focused learning sprint.
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Day {TODAY_DAY} · {COMPLETED_DAYS} completed
          </p>
        </header>

        <div className="mt-5 grid grid-cols-7 gap-1.5 rounded-lg bg-gray-900/70 p-3">
          {days.map((day) => {
            const isCompleted = day <= COMPLETED_DAYS
            const isToday = day === TODAY_DAY

            let classes =
              'aspect-square w-full rounded-[4px] border transition-transform'

            if (isToday) {
              classes +=
                ' border-blue-400 bg-blue-500/70 shadow-[0_0_14px_rgba(59,130,246,0.8)] animate-pulse'
            } else if (isCompleted) {
              classes +=
                ' border-emerald-500/60 bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.75)]'
            } else {
              classes +=
                ' border-gray-700/80 bg-gray-800 hover:border-gray-500 hover:bg-gray-700/80'
            }

            return (
              <div
                key={day}
                className={classes}
                aria-label={`Day ${day}`}
              />
            )
          })}
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Each square is one day of focused learning. Greens are done, blue is
          today, and the rest are waiting for you.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-gray-700/60 bg-gray-800/90 px-6 py-5 shadow-lg shadow-black/40 backdrop-blur">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
          Weekly Highlights
        </h2>
        <div className="space-y-3">
          {weekSummaries.map((week, index) => {
            const isActive = index === activeWeekIndex
            return (
            <div
              key={week.label}
              className={`cursor-pointer rounded-lg border bg-gray-900/60 px-4 py-3 transition-colors ${
                isActive
                  ? 'border-blue-400/80 shadow-[0_0_12px_rgba(59,130,246,0.7)]'
                  : 'border-gray-700/70 hover:border-gray-500'
              }`}
              onClick={() => navigate(`/progress/${index + 1}`)}
            >
              <p className="text-xs font-semibold text-gray-200">
                {week.label}
              </p>
              <p className="mt-1 text-xs text-gray-400">{week.description}</p>
            </div>
          )})}
        </div>
      </section>
    </main>
  )
}

export default Progress

