import { Route, Routes, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { Navbar } from './components/Navbar'
import { ProductsPage } from './pages/Products'
import { CartPage } from './pages/Cart'
import './App.css'

function App() {
  return (
    // CartProvider is kept at the top level so both pages and navbar share state.
    <CartProvider>
      {/* App shell sets up a full-height dark background with a constrained content column. */}
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-8 sm:px-6 lg:px-8">
          <Navbar />
          <div className="mt-6 flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              {/* Fallback keeps unknown URLs within the app and redirects to catalogue. */}
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </CartProvider>
  )
}

export default App
