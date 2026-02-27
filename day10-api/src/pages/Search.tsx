import { useEffect, useState } from 'react'
import { useMovieSearch } from '../hooks/useMovieSearch'
import { SearchBar } from '../components/SearchBar'
import { MovieCard } from '../components/MovieCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { ErrorMessage } from '../components/ErrorMessage'

type Filter = 'all' | 'movie' | 'series'

const FILTER_TABS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'movie', label: 'Movies' },
  { id: 'series', label: 'TV Shows' },
]

// This page owns the high-level search experience: query state,
// filters, and the different UI states (empty, loading, error, results).
export function Search() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [retryKey, setRetryKey] = useState(0)

  const { movies, isLoading, error, totalResults } = useMovieSearch(query, filter, retryKey)

  // We seed the first search with a sensible default so the page
  // feels alive immediately instead of empty.
  useEffect(() => {
    setQuery('Avengers')
  }, [])

  const handleRetry = () => {
    setRetryKey((current) => current + 1)
  }

  const showEmptyState = !isLoading && !error && (!query || query.trim().length < 3)

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-8 text-slate-50">
      <header className="mb-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Movie &amp; TV Search
          </h1>
          <p className="text-sm text-slate-400 sm:text-base">
            Explore movies, series, and episodes powered by OMDb.
          </p>
        </div>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search for a movie or TV show..."
          autoFocus
        />
        <nav className="mt-2 flex w-full justify-center">
          <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/70 p-1 text-xs font-medium text-slate-300 sm:text-sm">
            {FILTER_TABS.map((tab) => {
              const isActive = tab.id === filter
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`relative rounded-full px-4 py-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow shadow-indigo-900/50'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      {showEmptyState && (
        <div className="mt-12 flex flex-1 items-center justify-center text-center">
          <p className="max-w-md text-sm text-slate-400 sm:text-base">
            🎬 <span className="font-medium text-slate-200">Search for movies and TV shows...</span>{' '}
            Start typing at least three characters to see results.
          </p>
        </div>
      )}

      {!showEmptyState && (
        <main className="flex-1">
          {error && (
            <div className="mt-6">
              <ErrorMessage
                message={error}
                onRetry={handleRetry}
                retryLabel="Try again"
              />
            </div>
          )}

          {!error && (
            <>
              {typeof totalResults === 'number' && totalResults > 0 && (
                <p className="mb-4 text-sm text-slate-400">
                  Showing{' '}
                  <span className="font-semibold text-slate-200">
                    {new Intl.NumberFormat().format(movies.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-200">
                    {new Intl.NumberFormat().format(totalResults)}
                  </span>{' '}
                  results
                </p>
              )}

              {isLoading && (
                <section
                  aria-label="Loading search results"
                  className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
                >
                  {Array.from({ length: 8 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </section>
              )}

              {!isLoading && movies.length > 0 && (
                <section
                  aria-label="Search results"
                  className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
                >
                  {movies.map((movie) => (
                    <MovieCard key={movie.imdbID} movie={movie} />
                  ))}
                </section>
              )}

              {!isLoading && movies.length === 0 && !error && !showEmptyState && (
                <div className="mt-12 flex items-center justify-center text-center">
                  <p className="text-sm text-slate-400 sm:text-base">
                    No results found. Try adjusting your search terms.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      )}
    </div>
  )
}

export default Search

