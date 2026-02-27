import { useEffect, useState } from 'react'
import type { MovieDetail } from '../types'

// We reuse the same OMDB configuration as the search hook so the
// behaviour stays consistent across the app.
const OMDB_BASE_URL = 'https://www.omdbapi.com/'
const OMDB_API_KEY = '1263fa0e'

interface UseMovieDetailResult {
  movie: MovieDetail | null
  isLoading: boolean
  error: string | null
}

/**
 * Custom hook that fetches the full details for a single title.
 *
 * We do not debounce here because detail views are user-initiated
 * navigations, not free-form text input.
 */
export function useMovieDetail(imdbID: string | undefined): UseMovieDetailResult {
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!imdbID) {
      setMovie(null)
      setError('Missing movie identifier.')
      return
    }

    let isCancelled = false
    const controller = new AbortController()

    const fetchDetail = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams({
          apikey: OMDB_API_KEY,
          i: imdbID,
          plot: 'full',
        })

        const response = await fetch(`${OMDB_BASE_URL}?${params.toString()}`, {
          signal: controller.signal,
        })

        let data: (MovieDetail & { Response?: string; Error?: string }) | null = null

        try {
          // Similar to the search hook, we prefer to surface OMDb's own
          // error message, even when the HTTP status is non‑2xx.
          data = (await response.json()) as MovieDetail & { Response?: string; Error?: string }
        } catch {
          data = null
        }

        if (!response.ok || (data && data.Response === 'False')) {
          const statusSuffix = !response.ok ? ` (HTTP ${response.status})` : ''
          const message =
            (data && data.Error) ||
            (!response.ok ? 'Failed to load movie details.' : 'Movie not found.')
          throw new Error(`${message}${statusSuffix}`)
        }

        if (!isCancelled) {
          setMovie(data)
        }
      } catch (err) {
        if (isCancelled || (err instanceof DOMException && err.name === 'AbortError')) {
          return
        }

        const message =
          err instanceof Error ? err.message : 'Something went wrong while loading the movie.'

        setError(message)
        setMovie(null)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchDetail()

    // We clean up the in-flight request when the component unmounts
    // or the imdbID changes to avoid race conditions.
    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [imdbID])

  return { movie, isLoading, error }
}

