import { useEffect, useMemo, useState, type FC } from 'react'

// We keep the remote weather response shape minimal and explicit so that
// TypeScript can guarantee we only use fields that the API actually returns.
interface WeatherData {
  current: {
    temperature_2m: number
    weathercode: number
    relativehumidity_2m: number
  }
}

// We keep clock state as simple formatted strings so rendering stays cheap
// and we do all time computation in a single effect.
interface ClockState {
  time: string
  date: string
}

// We model loading states explicitly so the UI can be clear about whether
// data is still in-flight, has loaded, or failed.
type WeatherStatus = 'idle' | 'loading' | 'loaded' | 'error'

const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=28.6&longitude=77.2&current=temperature_2m,weathercode,relativehumidity_2m&timezone=Asia/Kolkata'

const NOTES_STORAGE_KEY = 'personal-dashboard:quick-notes'

// We keep quotes as structured data so we can easily change the palette
// and reuse this section elsewhere without touching the rendering logic.
interface MotivationalQuote {
  text: string
  author: string
  bgClass: string
  textClass: string
}

const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    text: 'The future depends on what you do today.',
    author: 'Mahatma Gandhi',
    bgClass: 'bg-indigo-600',
    textClass: 'text-slate-50',
  },
  {
    text: 'Success is the sum of small efforts, repeated day in and day out.',
    author: 'Robert Collier',
    bgClass: 'bg-emerald-600',
    textClass: 'text-slate-950',
  },
  {
    text: 'It always seems impossible until it’s done.',
    author: 'Nelson Mandela',
    bgClass: 'bg-sky-600',
    textClass: 'text-slate-950',
  },
  {
    text: 'Discipline is the bridge between goals and accomplishment.',
    author: 'Jim Rohn',
    bgClass: 'bg-amber-500',
    textClass: 'text-slate-950',
  },
  {
    text: 'Action is the foundational key to all success.',
    author: 'Pablo Picasso',
    bgClass: 'bg-rose-600',
    textClass: 'text-slate-50',
  },
  // ...additional quotes up to ~200 entries omitted here for brevity...
]

const App: FC = () => {
  // HEADER — live clock
  const [clock, setClock] = useState<ClockState>(() => {
    const now = new Date()
    return {
      time: now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      date: now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }
  })

  // WEATHER — remote data + status
  const [weatherStatus, setWeatherStatus] = useState<WeatherStatus>('idle')
  const [weather, setWeather] = useState<WeatherData | null>(null)

  // QUICK NOTES — persisted text + transient "Saved" indicator
  const [notes, setNotes] = useState<string>('')
  const [justSaved, setJustSaved] = useState<boolean>(false)
  const [hasLoadedNotes, setHasLoadedNotes] = useState<boolean>(false)

  // MOTIVATION — rotating quote with varying color palette
  const [quoteIndex, setQuoteIndex] = useState<number>(() =>
    Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length),
  )

  // We drive layout purely via classes instead of external CSS so the
  // component stays self-contained and easy to move between projects.

  // Initialize clock and keep it updated every second.
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setClock({
        time: now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        date: now.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      })
    }

    updateClock()
    const intervalId = window.setInterval(updateClock, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  // Load any previously-saved notes from localStorage once on startup.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(NOTES_STORAGE_KEY)
      if (stored != null) {
        setNotes(stored)
      }
      setHasLoadedNotes(true)
    } catch {
      // If localStorage is unavailable, we simply start with empty notes.
    }
  }, [])

  // Fetch weather data once at mount.
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherStatus('loading')
      try {
        const response = await fetch(WEATHER_URL)
        if (!response.ok) {
          throw new Error('Failed to fetch weather')
        }
        const data: WeatherData = await response.json()
        setWeather(data)
        setWeatherStatus('loaded')
      } catch {
        setWeatherStatus('error')
      }
    }

    fetchWeather()
  }, [])

  // Persist notes on every change and briefly show "Saved" feedback.
  // When notes become empty we immediately clear the flag so the indicator
  // does not remain visible with nothing to save.
  useEffect(() => {
    if (!hasLoadedNotes) {
      // Avoid overwriting any existing saved notes before we have hydrated
      // state from localStorage. This prevents the initial empty render from
      // clearing persisted data.
      return
    }

    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, notes)
    } catch {
      // Ignore persistence errors; the UI should still be usable without storage.
    }

    if (notes.length === 0) {
      setJustSaved(false)
      return
    }

    setJustSaved(true)
    const timeoutId = window.setTimeout(() => setJustSaved(false), 900)

    return () => window.clearTimeout(timeoutId)
  }, [notes, hasLoadedNotes])

  const weatherEmoji = useMemo(() => {
    if (!weather) return '❓'
    const code = weather.current.weathercode
    if (code === 0) return '☀️'
    if (code >= 1 && code <= 3) return '⛅'
    if (code === 45 || code === 48) return '🌫️'
    if (code >= 51 && code <= 67) return '🌧️'
    if (code >= 71 && code <= 77) return '❄️'
    if (code >= 80 && code <= 82) return '🌦️'
    if (code === 95) return '⛈️'
    return '❓'
  }, [weather])

  // We keep the progress values as constants so they are easy to tweak later.
  const currentDay = 7
  const totalDays = 42
  const progressPercent = Math.round((currentDay / totalDays) * 100)

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex]

  const handleNextQuote = (): void => {
    setQuoteIndex((previous) => (previous + 1) % MOTIVATIONAL_QUOTES.length)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center px-4 py-6 md:py-10 bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="w-full max-w-5xl transform scale-[0.9] origin-top">
        <main className="space-y-6 md:space-y-8">
        {/* HEADER */}
        <section className="bg-gray-800/90 rounded-xl p-6 md:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-xl shadow-black/40 border border-gray-700/60 backdrop-blur">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Hey Anant 👋
            </h1>
            <p className="text-sm md:text-base text-gray-400 mt-1">
              Welcome back to your personal dashboard.
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl md:text-2xl">{clock.time}</p>
            <p className="text-xs md:text-sm text-gray-400">{clock.date}</p>
          </div>
        </section>

        {/* MOTIVATIONAL QUOTE */}
        <section className="mb-2">
          <button
            type="button"
            onClick={handleNextQuote}
            className={`w-full rounded-xl p-6 md:p-8 text-left transition transform hover:scale-[1.01] shadow-xl shadow-black/40 border border-opacity-70 backdrop-blur ${currentQuote.bgClass} ${currentQuote.textClass}`}
          >
            <p className="text-xs uppercase tracking-[0.2em] opacity-80 mb-2">
              Daily motivation
            </p>
            <p className="text-xl md:text-2xl font-semibold leading-snug mb-3">
              {currentQuote.text}
            </p>
            <p className="text-sm md:text-base opacity-90">
              — {currentQuote.author}
            </p>
            <p className="mt-3 text-[11px] md:text-xs opacity-80">
              Tap anywhere on this card to see another quote.
            </p>
          </button>
        </section>

        {/* GRID: Weather + Quick Notes */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* WEATHER */}
          <div className="bg-gray-800/90 rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-lg shadow-black/40 border border-gray-700/60 backdrop-blur">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Weather — Delhi</h2>
              <span className="text-xs rounded-full bg-gray-700 px-3 py-1 text-gray-300">
                Live
              </span>
            </header>

            {weatherStatus === 'loading' && (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Fetching latest weather…
              </div>
            )}

            {weatherStatus === 'error' && (
              <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
                Unable to load weather right now.
              </div>
            )}

            {weatherStatus === 'loaded' && weather && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl md:text-5xl">{weatherEmoji}</div>
                  <div>
                    <p className="text-3xl md:text-4xl font-semibold">
                      {Math.round(weather.current.temperature_2m)}°C
                    </p>
                    <p className="text-sm text-gray-400">Delhi, India</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">
                      Humidity
                    </p>
                    <p>{Math.round(weather.current.relativehumidity_2m)}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">
                      Weather code
                    </p>
                    <p>{weather.current.weathercode}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* QUICK NOTES */}
          <div className="bg-gray-800/90 rounded-xl p-6 md:p-8 flex flex-col shadow-lg shadow-black/40 border border-gray-700/60 backdrop-blur">
            <header className="flex items-center justify-between mb-3">
              <h2 className="text-lg md:text-xl font-semibold">Quick Notes</h2>
              <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </header>

            <p className="text-xs md:text-sm text-gray-400 mb-3">
              Jot down anything on your mind. Notes auto‑save as you type and
              stay on this device.
            </p>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="flex-1 min-h-[140px] resize-none rounded-lg bg-gray-900/60 border border-gray-700 px-3 py-2 text-sm md:text-base text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ideas, todos, reminders…"
            />

            <div className="mt-2 flex items-center justify-between text-xs md:text-sm text-gray-500">
              <span>Auto‑saved to this browser.</span>
              <span
                className={`transition-opacity duration-200 ${
                  justSaved ? 'opacity-100' : 'opacity-0'
                } text-emerald-400`}
              >
                Saved ✓
              </span>
            </div>
          </div>
        </section>

        {/* MY LINKS + PROGRESS */}
        <section className="grid gap-6 md:grid-cols-1 lg:grid-cols-[2fr,3fr]">
          {/* MY LINKS */}
          <div className="bg-gray-800/90 rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-lg shadow-black/40 border border-gray-700/60 backdrop-blur">
            <header className="mb-3">
              <h2 className="text-lg md:text-xl font-semibold">My Links</h2>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Quick access to your important places.
              </p>
            </header>

            <div className="flex flex-wrap gap-3 mt-2">
              <LinkButton
                label="GitHub"
                href="https://github.com/anantjindal1"
              />
              <LinkButton label="LinkedIn" href="#" />
              <LinkButton label="Resume" href="#" />
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="bg-gray-800/90 rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-lg shadow-black/40 border border-gray-700/60 backdrop-blur">
            <header className="mb-3">
              <h2 className="text-lg md:text-xl font-semibold">Progress</h2>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Day {currentDay} of {totalDays} — Week 1 Complete! 🎉
              </p>
            </header>

            <div className="mt-2">
              <div className="w-full h-3 rounded-full bg-gray-900/70 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  role="progressbar"
                />
              </div>
              <p className="mt-2 text-xs md:text-sm text-gray-300">
                {progressPercent}% complete
              </p>
            </div>
          </div>
        </section>
        </main>
      </div>
    </div>
  )
}

interface LinkButtonProps {
  label: string
  href: string
}

// We keep links as a small reusable component so we can tune interactions
// (hover, focus, target) in one place and keep App.tsx readable.
const LinkButton: FC<LinkButtonProps> = ({ label, href }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-gray-900/70 border border-gray-700 px-4 py-2 text-sm md:text-base text-gray-100 hover:bg-gray-700 hover:border-gray-500 transition-colors"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
      <span>{label}</span>
    </a>
  )
}

export default App
