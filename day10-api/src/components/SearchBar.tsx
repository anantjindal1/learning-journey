import { useRef } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}

// This component centralises the search UX so both styling and
// behaviour (like clearing and focus management) stay consistent.
export function SearchBar({ value, onChange, placeholder, autoFocus }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleClear = () => {
    onChange('')
    // Returning focus to the input after clearing keeps keyboard-driven
    // searching smooth, especially on desktop.
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-2xl">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-5 py-4 pr-12 text-lg text-slate-50 shadow-lg shadow-black/30 outline-none ring-0 transition focus:border-indigo-400 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-100"
        >
          ✕
        </button>
      )}
    </div>
  )
}

