import { useEffect, useState } from 'react'
import type { Movie, SearchResponse } from '../types'

// We keep the API configuration close to the hooks so it is easy
// to swap to env variables or another backend later.
const OMDB_BASE_URL = 'https://www.omdbapi.com/'
const OMDB_API_KEY = '1263fa0e'

type SearchFilter = 'all' | 'movie' | 'series'

interface UseMovieSearchResult {
  movies: Movie[]
  isLoading: boolean
  error: string | null
  totalResults: number | null
}

/**
 * Custom hook that searches the OMDB API for movies and series.
 *
 * We accept a `filter` and `retryKey` in addition to the query so the
 * UI can control the type tabs and provide a manual "retry" trigger.
 * The primary contract is still that this hook is driven by a query string.
 */
export function useMovieSearch(
  query: string,
  filter: SearchFilter = 'all',
  retryKey: number = 0,
): UseMovieSearchResult {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalResults, setTotalResults] = useState<number | null>(null)

  useEffect(() => {
    const trimmedQuery = query.trim()

    // We reset local state when the query is too short to search.
    if (trimmedQuery.length < 3) {
      setMovies([])
      setTotalResults(null)
      setError(null)
      setIsLoading(false)
      return
    }

    let isCancelled = false
    const controller = new AbortController()

    // Debounce the network call so we do not hit the API on every keystroke.
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams({
          apikey: OMDB_API_KEY,
          s: trimmedQuery,
        })

        // We only send `type` when the user picks a specific filter so the
        // "All" tab truly queries everything.
        if (filter !== 'all') {
          params.set('type', filter)
        }

        const response = await fetch(`${OMDB_BASE_URL}?${params.toString()}`, {
          signal: controller.signal,
        })

        let data: SearchResponse | (Partial<SearchResponse> & { Response?: string; Error?: string })

        try {
          // OMDb always responds with JSON, even on failures, so we try
          // to parse the body first to surface helpful error messages.
          data = (await response.json()) as SearchResponse
        } catch {
          data = { Response: 'False', Error: undefined, Search: [], totalResults: '0' }
        }

        if (!response.ok || data.Response === 'False') {
          const statusSuffix = !response.ok ? ` (HTTP ${response.status})` : ''
          const message =
            data.Error ||
            (!response.ok ? 'Failed to fetch movies. Please try again.' : 'No results found.')
          throw new Error(`${message}${statusSuffix}`)
        }

        if (!isCancelled) {
          setMovies(data.Search ?? [])
          // OMDB sends totalResults as a string; we normalise to a number for the UI.
          const parsedTotal = Number.parseInt(data.totalResults, 10)
          setTotalResults(Number.isNaN(parsedTotal) ? null : parsedTotal)
        }
      } catch (err) {
        if (isCancelled || (err instanceof DOMException && err.name === 'AbortError')) {
          return
        }

        const message =
          err instanceof Error ? err.message : 'Something went wrong while searching.'

        setError(message)
        setMovies([])
        setTotalResults(null)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }, 500)

    // We clean up both the timeout and the fetch so that fast typing
    // and route changes do not leave stray requests running.
    return () => {
      isCancelled = true
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [query, filter, retryKey])

  return { movies, isLoading, error, totalResults }
}

