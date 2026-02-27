import { useMemo, useState } from 'react'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

type CategoryFilter = 'All' | 'Peripherals' | 'Furniture'

// Static product catalogue keeps UI predictable and avoids fetching for this demo.
const PRODUCTS: Product[] = [
  {
    id: 'keyboard',
    name: 'Mechanical Keyboard',
    emoji: '🎹',
    price: 89,
    category: 'Peripherals',
  },
  {
    id: 'headphones',
    name: 'Noise Cancelling Headphones',
    emoji: '🎧',
    price: 199,
    category: 'Peripherals',
  },
  {
    id: 'desk',
    name: 'Standing Desk',
    emoji: '🖥️',
    price: 399,
    category: 'Furniture',
  },
  {
    id: 'webcam',
    name: 'Webcam',
    emoji: '📷',
    price: 79,
    category: 'Peripherals',
  },
  {
    id: 'lamp',
    name: 'LED Desk Lamp',
    emoji: '💡',
    price: 49,
    category: 'Peripherals',
  },
  {
    id: 'mousepad',
    name: 'Mouse Pad XL',
    emoji: '🖱️',
    price: 29,
    category: 'Peripherals',
  },
  {
    id: 'usbhub',
    name: 'USB Hub',
    emoji: '🔌',
    price: 39,
    category: 'Peripherals',
  },
  {
    id: 'monitorarm',
    name: 'Monitor Arm',
    emoji: '🦾',
    price: 89,
    category: 'Furniture',
  },
]

export function ProductsPage() {
  const { state, addToCart, increment, decrement } = useCart()
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null)

  const filteredProducts = useMemo(
    () =>
      activeCategory === 'All'
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === activeCategory),
    [activeCategory],
  )

  const handleAdd = (product: Product) => {
    addToCart(product)
    setRecentlyAddedId(product.id)
    // Briefly show feedback to acknowledge the action without managing long-lived state.
    setTimeout(() => {
      setRecentlyAddedId((current) => (current === product.id ? null : current))
    }, 800)
  }

  return (
    <main className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Curated gear for productive developers, all in a cozy dark theme.
          </p>
        </div>
      </div>

      <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/60 p-1 text-xs sm:text-sm">
        {(['All', 'Peripherals', 'Furniture'] as const).map((cat) => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                isActive
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const isAdded = recentlyAddedId === product.id
          const inCart = state.items.find(
            (item) => item.product.id === product.id,
          )
          return (
            <article
              key={product.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm ring-1 ring-black/0 transition hover:-translate-y-0.5 hover:border-slate-500 hover:ring-slate-500/20"
            >
              <div>
                <div className="mb-3 text-3xl" aria-hidden="true">
                  {product.emoji}
                </div>
                <h2 className="text-sm font-semibold text-slate-50">
                  {product.name}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  {product.category}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-base font-semibold text-slate-50">
                  ₹ {product.price.toLocaleString('en-IN')}
                </p>
                {inCart ? (
                  <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs">
                    <button
                      type="button"
                      className="h-6 w-6 rounded-full text-slate-300 hover:bg-slate-800"
                      onClick={() => decrement(product.id)}
                    >
                      −
                    </button>
                    <span className="mx-2 min-w-[1.5rem] text-center text-slate-100">
                      {inCart.quantity}
                    </span>
                    <button
                      type="button"
                      className="h-6 w-6 rounded-full text-slate-300 hover:bg-slate-800"
                      onClick={() => increment(product.id)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isAdded
                        ? 'bg-emerald-500 text-emerald-950'
                        : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    }`}
                    onClick={() => handleAdd(product)}
                  >
                    {isAdded ? 'Added ✓' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}

export default ProductsPage

