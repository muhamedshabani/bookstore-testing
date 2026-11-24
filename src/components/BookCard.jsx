import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import BookCover from './BookCover'

export default function BookCard({ book }) {
  const { add } = useCart()

  return (
    <article className="group relative flex flex-col">
      <div className="relative bg-surface p-6 transition-colors duration-200 group-hover:bg-surface-strong">
        <BookCover book={book} className="mx-auto w-full max-w-44 shadow-md transition-transform duration-300 group-hover:-translate-y-1" />
        <button
          type="button"
          onClick={() => add(book)}
          aria-label={`Add ${book.title} to cart`}
          className="absolute right-3 bottom-3 z-10 grid size-11 place-items-center bg-white text-ink shadow-sm transition-colors duration-200 hover:bg-brand-strong hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <ShoppingBag className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 flex flex-col gap-0.5">
        <span className="text-sm text-muted">{book.categoryName}</span>
        <h3 className="font-bold leading-snug text-ink">
          <Link to={`/books/${book.id}`} className="after:absolute after:inset-0 hover:text-brand-strong">
            {book.title}
          </Link>
        </h3>
        <span className="text-sm text-ink-soft">{book.authorName}</span>
        <span className="mt-1 font-semibold text-ink">{formatPrice(book.price)}</span>
      </div>
    </article>
  )
}
