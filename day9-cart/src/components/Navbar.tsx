import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext'

// Simple navbar shared across pages.
// Uses NavLink for active state styling and shows a live cart item count.
export function Navbar() {
  const {
    state: { items },
  } = useCart()

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const baseLinkClasses =
    'text-sm font-medium px-3 py-2 rounded-md transition-colors inline-flex items-center gap-2'

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 pb-3 pt-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <NavLink
          to="/products"
          className="text-lg font-semibold tracking-tight text-slate-100"
        >
          TechShop <span aria-hidden="true">🛒</span>
        </NavLink>
        <nav className="flex items-center gap-2 text-slate-300">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `${baseLinkClasses} ${
                isActive
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-50'
              }`
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `${baseLinkClasses} ${
                isActive
                  ? 'bg-slate-800 text-slate-50'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-50'
              }`
            }
          >
            <span aria-hidden="true">🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span
                className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white"
                aria-label={`${itemCount} items in cart`}
              >
                {itemCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar

