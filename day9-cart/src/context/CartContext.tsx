/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { CartAction, CartState, Product } from '../types'

// Using a dedicated key keeps localStorage usage namespaced to this app.
const CART_STORAGE_KEY = 'techshop-cart-state'

const initialState: CartState = {
  items: [],
  // Saved items are kept separate so users can temporarily park products.
  savedItems: [],
}

function loadInitialState(): CartState {
  // Guard against SSR or non-browser environments.
  if (typeof window === 'undefined') return initialState

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return initialState
    const parsed = JSON.parse(stored) as Partial<CartState>
    // Basic shape validation to avoid runtime errors from corrupted data.
    if (!parsed || !Array.isArray(parsed.items)) return initialState
    return {
      items: parsed.items,
      // Backwards-compatible default if older data did not have savedItems.
      savedItems: Array.isArray(parsed.savedItems) ? parsed.savedItems : [],
    }
  } catch {
    return initialState
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.items.find(
        (item) => item.product.id === action.payload.id,
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { product: action.payload, quantity: 1 }],
      }
    }
    case 'REMOVE_FROM_CART': {
      return {
        ...state,
        items: state.items.filter(
          (item) => item.product.id !== action.payload.productId,
        ),
      }
    }
    case 'INCREMENT': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      }
    }
    case 'DECREMENT': {
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.product.id === action.payload.productId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          .filter((item) => item.quantity > 0),
      }
    }
    case 'CLEAR_CART': {
      return { ...state, items: [] }
    }
    case 'SAVE_FOR_LATER': {
      const item = state.items.find(
        (entry) => entry.product.id === action.payload.productId,
      )
      if (!item) return state

      const remainingItems = state.items.filter(
        (entry) => entry.product.id !== action.payload.productId,
      )

      const existingSaved = state.savedItems.find(
        (entry) => entry.product.id === action.payload.productId,
      )

      const newSavedItems = existingSaved
        ? state.savedItems.map((entry) =>
            entry.product.id === action.payload.productId
              ? { ...entry, quantity: entry.quantity + item.quantity }
              : entry,
          )
        : [...state.savedItems, item]

      return {
        ...state,
        items: remainingItems,
        savedItems: newSavedItems,
      }
    }
    case 'MOVE_TO_CART': {
      const savedItem = state.savedItems.find(
        (entry) => entry.product.id === action.payload.productId,
      )
      if (!savedItem) return state

      const remainingSavedItems = state.savedItems.filter(
        (entry) => entry.product.id !== action.payload.productId,
      )

      const existingInCart = state.items.find(
        (entry) => entry.product.id === action.payload.productId,
      )

      const newItems = existingInCart
        ? state.items.map((entry) =>
            entry.product.id === action.payload.productId
              ? {
                  ...entry,
                  quantity: entry.quantity + savedItem.quantity,
                }
              : entry,
          )
        : [...state.items, savedItem]

      return {
        ...state,
        items: newItems,
        savedItems: remainingSavedItems,
      }
    }
    default: {
      return state
    }
  }
}

interface CartContextValue {
  state: CartState
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  increment: (productId: string) => void
  decrement: (productId: string) => void
  clearCart: () => void
  saveForLater: (productId: string) => void
  moveToCart: (productId: string) => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  // Initializer function ensures localStorage is only read once on mount.
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState)

  // Persist cart on every change so refreshes and new tabs stay in sync.
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Swallow storage errors; cart should still work in-memory.
    }
  }, [state])

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      addToCart: (product) => dispatch({ type: 'ADD_TO_CART', payload: product }),
      removeFromCart: (productId) =>
        dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } }),
      increment: (productId) =>
        dispatch({ type: 'INCREMENT', payload: { productId } }),
      decrement: (productId) =>
        dispatch({ type: 'DECREMENT', payload: { productId } }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      // These helpers model the "Save for Later" UX that e-commerce users expect.
      saveForLater: (productId) =>
        dispatch({ type: 'SAVE_FOR_LATER', payload: { productId } }),
      moveToCart: (productId) =>
        dispatch({ type: 'MOVE_TO_CART', payload: { productId } }),
    }),
    [state],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  // Custom hook encapsulates context access and guards against misuse.
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}

