import { ChevronRight, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { authorsApi, booksApi } from '../api/client'
import BookCard from '../components/BookCard'
import BookCover from '../components/BookCover'
import { ErrorState, Spinner } from '../components/States'
import { useCart } from '../context/CartContext'
import { useApi } from '../hooks/useApi'
import { formatPrice, publishedYear } from '../lib/format'
import NotFound from './NotFound'

export default function BookDetail() {
  const { id } = useParams()
  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)

  const { data, error, loading, reload } = useApi(async () => {
    const book = await booksApi.get(id)
    const moreByAuthor = await authorsApi.books(book.authorId)
    return { book, moreByAuthor: moreByAuthor.filter((b) => b.id !== book.id).slice(0, 4) }
  }, [id])

  if (loading) return <Spinner label="Loading book" />
  if (error?.status === 404) return <NotFound what="book" />
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState error={error} onRetry={reload} />
      </div>
    )
  }

  const { book, moreByAuthor } = data
  const year = publishedYear(book.publishedDate)

  return (
    <div className="container-page py-10">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-muted">
          <li>
            <Link to="/shop" className="hover:text-ink">
              Shop
            </Link>
          </li>
          <ChevronRight className="size-4" aria-hidden="true" />
          <li>
            <Link to={`/shop?category=${book.categoryId}`} className="hover:text-ink">
              {book.categoryName}
            </Link>
          </li>
          <ChevronRight className="size-4" aria-hidden="true" />
          <li aria-current="page" className="text-ink">
            {book.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-12 md:grid-cols-2">
        <div className="bg-surface p-10 sm:p-16">
          <BookCover book={book} size="L" eager className="mx-auto w-full max-w-80 shadow-2xl" />
        </div>

        <div className="flex flex-col">
          <Link to={`/shop?category=${book.categoryId}`} className="kicker hover:text-brand-deep">
            {book.categoryName}
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{book.title}</h1>
          <p className="mt-2 text-lg text-ink-soft">
            by{' '}
            <Link to={`/authors/${book.authorId}`} className="font-semibold text-ink underline-offset-4 hover:underline">
              {book.authorName}
            </Link>
          </p>

          <p className="mt-6 text-3xl font-bold text-brand-strong">{formatPrice(book.price)}</p>

          <p className="mt-6 text-ink-soft">{book.description ?? 'No description available for this book yet.'}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex items-center border border-line" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="grid size-12 place-items-center hover:bg-surface disabled:opacity-40"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <span className="w-10 text-center font-semibold" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="grid size-12 place-items-center hover:bg-surface"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
            <button type="button" onClick={() => add(book, quantity)} className="btn-solid min-h-12 flex-1 sm:flex-none sm:px-12">
              Add to cart
            </button>
          </div>

          <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-line pt-6 text-sm">
            <dt className="font-semibold">Author</dt>
            <dd className="text-ink-soft">{book.authorName}</dd>
            <dt className="font-semibold">Category</dt>
            <dd className="text-ink-soft">{book.categoryName}</dd>
            <dt className="font-semibold">Published</dt>
            <dd className="text-ink-soft">{year ?? 'Unknown'}</dd>
            <dt className="font-semibold">ISBN</dt>
            <dd className="font-mono text-ink-soft">{book.isbn}</dd>
          </dl>
        </div>
      </div>

      {moreByAuthor.length > 0 && (
        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="section-title">More by {book.authorName}</h2>
            <Link to={`/authors/${book.authorId}`} className="shrink-0 text-sm font-semibold text-brand-strong hover:underline">
              View author
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {moreByAuthor.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
