import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import BookCover from './BookCover'
import Modal from './Modal'

export default function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove, subtotal, count } = useCart()

  return (
    <Modal open={isOpen} onClose={close} title={`Your cart (${count})`} variant="drawer">
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <ShoppingBag className="size-10 text-muted" aria-hidden="true" />
          <p className="text-ink-soft">Your cart is empty.</p>
          <Link to="/shop" onClick={close} className="btn-outline">
            Browse books
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <BookCover book={item} size="S" className="w-16 shrink-0" />
                <div className="flex flex-1 flex-col">
                  <Link to={`/books/${item.id}`} onClick={close} className="font-semibold leading-snug hover:text-brand-strong">
                    {item.title}
                  </Link>
                  <span className="text-sm text-muted">{item.authorName}</span>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center border border-line">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.title}`}
                        className="grid size-11 place-items-center hover:bg-surface"
                      >
                        <Minus className="size-4" aria-hidden="true" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        aria-label={`Increase quantity of ${item.title}`}
                        className="grid size-11 place-items-center hover:bg-surface"
                      >
                        <Plus className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.title} from cart`}
                  className="-mr-2 grid size-11 shrink-0 place-items-center text-muted hover:text-danger"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <footer className="border-t border-line px-6 py-5">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-sm text-muted">Checkout isn't connected yet. Your cart is saved in this browser.</p>
            <button type="button" disabled className="btn-solid mt-4 w-full">
              Checkout
            </button>
          </footer>
        </>
      )}
    </Modal>
  )
}
