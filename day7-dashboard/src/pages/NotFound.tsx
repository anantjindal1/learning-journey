import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const NotFound: FC = () => {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-700/70 bg-gray-900/80 px-6 py-8 text-center shadow-xl shadow-black/50 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-50">
          Lost in the learning journey
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          This page doesn&apos;t exist. It might have moved, or the URL may be
          slightly off.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2 text-sm font-medium text-white shadow-md shadow-blue-500/40 transition hover:bg-blue-400"
        >
          Go Home
        </button>
      </div>
    </main>
  )
}

export default NotFound

