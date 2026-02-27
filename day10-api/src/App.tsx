import { Navigate, Route, Routes } from 'react-router-dom'
import Search from './pages/Search'
import MovieDetail from './pages/MovieDetail'

// App is intentionally thin: it owns routing and the outer shell
// (dark background + typography), while pages own their own layouts.
function App() {
  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App

