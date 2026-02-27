export interface Movie {
  imdbID: string
  Title: string
  Year: string
  Type: 'movie' | 'series' | 'episode'
  Poster: string
}

export interface MovieDetail {
  imdbID: string
  Title: string
  Year: string
  Genre: string
  Director: string
  Plot: string
  Poster: string
  imdbRating: string
  Runtime: string
  Actors: string
  Type: string
}

export interface SearchResponse {
  Search: Movie[]
  totalResults: string
  Response: string
  Error?: string
}

