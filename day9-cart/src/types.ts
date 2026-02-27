// Core domain types for the shopping cart.
// Keeping these centralized makes reducer and components easier to reason about.

export interface Product {
  id: string
  name: string
  price: number
  emoji: string
  category: 'Peripherals' | 'Furniture'
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
  savedItems: CartItem[]
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'INCREMENT'; payload: { productId: string } }
  | { type: 'DECREMENT'; payload: { productId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SAVE_FOR_LATER'; payload: { productId: string } }
  | { type: 'MOVE_TO_CART'; payload: { productId: string } }

