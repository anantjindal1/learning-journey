import { useState, type FC } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

// We keep navigation structure data-driven so adding new routes stays simple
// and the active state styling logic lives in one place.
const NAV_ITEMS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Tasks', to: '/tasks' },
  { label: 'Progress', to: '/progress' },
  { label: 'About', to: '/about' },
] as const

const Navbar: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const toggleOpen = (): void => {
    setIsOpen((open) => !open)
  }

  const closeMenu = (): void => {
    setIsOpen(false)
  }

  const baseLinkClasses =
    'block px-3 py-2 text-sm md:text-[13px] font-medium rounded-md transition-colors'

  const getLinkClasses = (to: string): string => {
    const isActive =
      to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

    if (isActive) {
      return [
        baseLinkClasses,
        'bg-slate-100 text-slate-900 shadow-sm',
        'md:bg-slate-100/90 md:text-slate-900',
      ].join(' ')
    }

    return [
      baseLinkClasses,
      'text-slate-200 hover:text-white hover:bg-slate-700/80',
    ].join(' ')
  }

  return (
    <nav className="rounded-xl border border-slate-700/70 bg-slate-900/80 px-4 py-3 shadow-lg shadow-black/40 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 text-xs font-semibold text-slate-900 shadow-md shadow-cyan-500/40">
            AJ
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              AJ<span className="text-blue-400">.dev</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Learning Journey · Day 7
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={getLinkClasses(item.to)}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
          aria-expanded={isOpen}
          onClick={toggleOpen}
        >
          <span className="sr-only">Open main menu</span>
          <span className="flex h-4 w-4 flex-col justify-between">
            <span
              className={`h-0.5 w-full rounded-full bg-current transition-transform ${
                isOpen ? 'translate-y-1.5 rotate-45' : ''
              }`}
            />
            <span
              className={`h-0.5 w-full rounded-full bg-current transition-opacity ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`h-0.5 w-full rounded-full bg-current transition-transform ${
                isOpen ? '-translate-y-1.5 -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="mt-3 space-y-1 border-t border-slate-700/70 pt-3 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={getLinkClasses(item.to)}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar

