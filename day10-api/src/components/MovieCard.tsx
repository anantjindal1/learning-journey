import { Link } from 'react-router-dom'
import type { Movie } from '../types'

interface MovieCardProps {
  movie: Movie
}

// We keep this card focused on layout and navigation so the list
// rendering logic stays lean in the page component.
export function MovieCard({ movie }: MovieCardProps) {
  const isPosterAvailable = movie.Poster && movie.Poster !== 'N/A'
  const posterSrc = isPosterAvailable
    ? movie.Poster
    : 'https://via.placeholder.com/300x450?text=No+Image'

  const typeLabel =
    movie.Type === 'movie' ? 'Movie' : movie.Type === 'series' ? 'TV Series' : 'Episode'

  return (
    <Link
      to={`/movie/${movie.imdbID}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-slate-900/70 ring-1 ring-slate-800 transition hover:-translate-y-1 hover:bg-slate-900 hover:shadow-xl hover:shadow-indigo-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
        <img
          src={posterSrc}
          alt={movie.Title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100 backdrop-blur">
          {typeLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-50">{movie.Title}</h3>
        <p className="text-xs font-medium text-slate-400">{movie.Year}</p>
      </div>
    </Link>
  )
}

