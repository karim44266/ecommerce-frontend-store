'use client'

import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import type { Product } from '@/lib/api'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; product: Product; quantity?: number }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'LOAD'; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const qty = action.quantity ?? 1
      const existing = state.items.find((i) => i.product.id === action.product.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + qty }
              : i,
          ),
        }
      }
      return { items: [...state.items, { product: action.product, quantity: qty }] }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.product.id !== action.productId) }
    case 'UPDATE':
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.product.id !== action.productId) }
      }
      return {
        items: state.items.map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i,
        ),
      }
    case 'CLEAR':
      return { items: [] }
    case 'LOAD':
      return { items: action.items }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const CART_KEY = 'store_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  // Restore cart from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      if (raw) {
        dispatch({ type: 'LOAD', items: JSON.parse(raw) as CartItem[] })
      }
    } catch {
      // ignore
    }
  }, [])

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(state.items))
  }, [state.items])

  const addItem = useCallback((product: Product, quantity = 1) => {
    dispatch({ type: 'ADD', product, quantity })
  }, [])

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE', productId })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE', productId, quantity })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  )

  return (
    <CartContext.Provider
      value={{ items: state.items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
