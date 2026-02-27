import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const TAX_RATE = 0.18 // 18% GST for India.

export function CartPage() {
  const {
    state,
    increment,
    decrement,
    removeFromCart,
    clearCart,
    saveForLater,
    moveToCart,
  } = useCart()

  const subtotal = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  const handleCheckout = () => {
    // Simple client-side confirmation; real flows would integrate payment.
    alert('Order placed! 🎉')
  }

  if (state.items.length === 0 && state.savedItems.length === 0) {
    return (
      <main className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Your cart is empty
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Add some tech goodies to power up your workspace.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>Looks like you&apos;re just browsing for now.</p>
          <Link
            to="/products"
            className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Your Cart
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Review your picks before you upgrade your setup.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ul className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          {state.items.map((item) => (
            <li
              key={item.product.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl" aria-hidden="true">
                  {item.product.emoji}
                </div>
                <div>
                  <div className="font-medium text-slate-50">
                    {item.product.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">
                    ₹ {item.product.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs">
                  <button
                    type="button"
                    className="h-6 w-6 rounded-full text-slate-300 hover:bg-slate-800"
                    onClick={() => decrement(item.product.id)}
                  >
                    −
                  </button>
                  <span className="mx-3 min-w-[1.5rem] text-center text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="h-6 w-6 rounded-full text-slate-300 hover:bg-slate-800"
                    onClick={() => increment(item.product.id)}
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-400 hover:text-sky-400"
                    onClick={() => saveForLater(item.product.id)}
                  >
                    Save for later
                  </button>
                  <button
                    type="button"
                    className="text-xs font-medium text-slate-400 hover:text-red-400"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-sm">
          <h2 className="text-base font-semibold text-slate-50">Summary</h2>
          <div className="space-y-1 text-slate-300">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>
                ₹ {subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax (18% GST)</span>
              <span>₹ {tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-sm font-semibold text-slate-50">
            <span>Total</span>
            <span>
              ₹ {total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>
          <button
            type="button"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400"
            onClick={handleCheckout}
          >
            Checkout
          </button>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-slate-50"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </aside>
      </section>

      {state.savedItems.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm">
          <h2 className="text-base font-semibold text-slate-50">Saved for later</h2>
          <p className="text-xs text-slate-400">
            Items here are not included in your total but are easy to add back.
          </p>
          <ul className="mt-2 space-y-2">
            {state.savedItems.map((item) => (
              <li
                key={item.product.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl" aria-hidden="true">
                    {item.product.emoji}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-50">
                      {item.product.name}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      ₹ {item.product.price.toLocaleString('en-IN')} · Qty {item.quantity}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-slate-200"
                  onClick={() => moveToCart(item.product.id)}
                >
                  Move to cart
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

export default CartPage

