import { useNavigate, useParams } from 'react-router-dom'
import { useMovieDetail } from '../hooks/useMovieDetail'
import { ErrorMessage } from '../components/ErrorMessage'

// This page is intentionally focused on layout and presentation;
// data fetching and error handling are delegated to the custom hook.
export function MovieDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { movie, isLoading, error } = useMovieDetail(id)

  const handleBack = () => {
    navigate(-1)
  }

  const renderGenreBadges = (genre?: string) => {
    if (!genre) return null
    return genre.split(',').map((item) => (
      <span
        key={item.trim()}
        className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100 ring-1 ring-slate-700"
      >
        {item.trim()}
      </span>
    ))
  }

  const renderTypeBadge = (type?: string) => {
    if (!type) return null
    const label = type.toLowerCase() === 'movie' ? 'Movie' : 'TV Series'
    const colorClasses =
      type.toLowerCase() === 'movie'
        ? 'bg-indigo-500/90 text-white ring-indigo-300/70'
        : 'bg-emerald-500/90 text-white ring-emerald-300/70'

    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${colorClasses}`}
      >
        {label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-8 text-slate-50">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-sm font-medium text-slate-100 shadow-sm shadow-black/40 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          ← Back
        </button>

        <div className="flex flex-1 flex-col gap-8 md:flex-row">
          <div className="flex w-full animate-pulse justify-center md:w-1/3">
            <div className="h-[420px] w-64 rounded-2xl bg-slate-800" />
          </div>
          <div className="mt-4 flex flex-1 animate-pulse flex-col gap-4 md:mt-0">
            <div className="h-8 w-3/4 rounded bg-slate-700" />
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-slate-700" />
              <div className="h-6 w-16 rounded-full bg-slate-700" />
            </div>
            <div className="h-5 w-1/3 rounded bg-slate-700" />
            <div className="mt-2 space-y-2">
              <div className="h-3 w-full rounded bg-slate-800" />
              <div className="h-3 w-11/12 rounded bg-slate-800" />
              <div className="h-3 w-4/5 rounded bg-slate-800" />
            </div>
            <div className="mt-4 flex gap-6">
              <div className="h-10 w-24 rounded-lg bg-slate-800" />
              <div className="h-10 w-28 rounded-lg bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-8 text-slate-50">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-sm font-medium text-slate-100 shadow-sm shadow-black/40 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          ← Back
        </button>
        <ErrorMessage
          title="Movie not found"
          message={error || 'We could not find details for this title.'}
          onRetry={handleBack}
          retryLabel="Go back"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-10 pt-8 text-slate-50">
      <button
        type="button"
        onClick={handleBack}
        className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-sm font-medium text-slate-100 shadow-sm shadow-black/40 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        ← Back
      </button>

      <div className="flex flex-1 flex-col gap-8 md:flex-row">
        <div className="flex justify-center md:w-1/3">
          <div className="overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800 shadow-xl shadow-black/50">
            <img
              src={movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : undefined}
              alt={movie.Title}
              className="h-full w-full max-h-[480px] object-cover"
            />
          </div>
        </div>

        <div className="mt-2 flex flex-1 flex-col gap-4 md:mt-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              {movie.Title}
            </h1>
            {renderTypeBadge(movie.Type)}
          </div>
          <p className="text-sm text-slate-400">
            {movie.Year} • {movie.Runtime}
          </p>

          <div className="mt-1 flex flex-wrap gap-2">{renderGenreBadges(movie.Genre)}</div>

          <section className="mt-4 space-y-2 text-sm leading-relaxed text-slate-200">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Plot
            </h2>
            <p>{movie.Plot}</p>
          </section>

          <section className="mt-4 grid gap-4 text-sm text-slate-200 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Director
              </h3>
              <p className="mt-1">{movie.Director}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Cast
              </h3>
              <p className="mt-1">{movie.Actors}</p>
            </div>
          </section>

          <section className="mt-6 flex flex-wrap items-center gap-6">
            <div className="inline-flex items-baseline gap-2 rounded-2xl bg-slate-900 px-4 py-2 ring-1 ring-slate-700">
              <span className="text-2xl">⭐</span>
              <div>
                <span className="text-xl font-semibold text-slate-50">
                  {movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A'}
                </span>
                <span className="ml-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  IMDb Rating
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail

