interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
}

// A small, reusable error surface so both pages can stay visually
// consistent while customising the primary action.
export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Retry',
}: ErrorMessageProps) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-red-500/40 bg-red-950/40 px-6 py-5 text-center shadow-lg shadow-red-900/40">
      <h2 className="text-lg font-semibold text-red-100">{title}</h2>
      <p className="mt-2 text-sm text-red-200/90">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-900/60 transition hover:bg-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}

