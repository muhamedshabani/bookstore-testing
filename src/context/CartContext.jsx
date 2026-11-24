import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// Client-side cart, kept in localStorage. The API has no orders endpoint yet,
// so the cart only stores a snapshot of each book.
const CartContext = createContext(null)
const STORAGE_KEY = 'bookstore.cart'

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage can be unavailable (private mode); the cart still works for this visit.
    }
  }, [items])

  const value = useMemo(() => {
    const add = (book, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.id === book.id)
        if (existing) {
          return current.map((item) =>
            item.id === book.id ? { ...item, quantity: item.quantity + quantity } : item,
          )
        }
        const { id, title, authorName, price, isbn } = book
        return [...current, { id, title, authorName, price, isbn, quantity }]
      })
      setIsOpen(true)
    }

    const setQuantity = (id, quantity) =>
      setItems((current) =>
        quantity <= 0
          ? current.filter((item) => item.id !== id)
          : current.map((item) => (item.id === id ? { ...item, quantity } : item)),
      )

    const remove = (id) => setItems((current) => current.filter((item) => item.id !== id))
    const clear = () => setItems([])

    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return {
      items,
      count,
      subtotal,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQuantity,
      remove,
      clear,
    }
  }, [items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
