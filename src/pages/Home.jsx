import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { authorsApi, booksApi, categoriesApi } from '../api/client'
import BookCard from '../components/BookCard'
import BookCover from '../components/BookCover'
import { ErrorState, LoadingGrid } from '../components/States'
import { useCart } from '../context/CartContext'
import { useApi } from '../hooks/useApi'
import { authorFullName, formatPrice, publishedYear } from '../lib/format'

const SLIDES = [
  { category: 'Science Fiction', lead: 'step into', headline: 'Other Worlds' },
  { category: 'Classics', lead: 'rediscover', headline: 'Timeless Stories' },
  { category: 'Mystery', lead: 'find out', headline: 'Whodunit' },
]

const SLIDE_INTERVAL = 6000

function useReducedMotion() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  return reduced
}

function Hero({ books }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = useReducedMotion()

  const slides = useMemo(
    () =>
      SLIDES.map((slide) => ({
        ...slide,
        books: books.filter((b) => b.categoryName === slide.category).slice(0, 3),
      })).filter((slide) => slide.books.length > 0),
    [books],
  )

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [paused, reducedMotion, slides.length])

  if (slides.length === 0) return null
  const current = slides[index % slides.length]
  const go = (step) => setIndex((i) => (i + step + slides.length) % slides.length)
  const categoryId = current.books[0].categoryId

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative overflow-hidden bg-surface"
    >
      <div
        key={current.category}
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${slides.length}: ${current.category}`}
        className="container-page grid min-h-[min(80dvh,640px)] items-center gap-10 py-14 motion-safe:animate-[fade-in_600ms_ease-out] md:grid-cols-2"
      >
        <div className="max-w-xl">
          <p className="kicker">{current.category}</p>
          <p className="mt-4 text-3xl font-medium text-ink-soft sm:text-4xl">{current.lead}</p>
          <h1 className="mt-1 text-4xl leading-[1.05] font-extrabold uppercase tracking-tight sm:text-6xl">
            {current.headline}
          </h1>
          <p className="mt-6 max-w-md text-ink-soft">
            {current.books.length} hand-picked {current.category.toLowerCase()} titles, from{' '}
            {current.books[0].authorName} and more.
          </p>
          <Link to={`/shop?category=${categoryId}`} className="btn-outline mt-8 px-10">
            View collection
          </Link>
        </div>

        <div className="relative mx-auto flex h-72 w-full max-w-md items-center justify-center sm:h-96" aria-hidden="true">
          {current.books.map((book, i) => {
            const positions = [
              'z-30 w-40 sm:w-52',
              'z-20 w-32 -translate-x-[70%] -rotate-6 sm:w-44',
              'z-10 w-32 translate-x-[70%] rotate-6 sm:w-44',
            ]
            return (
              <div key={book.id} className={`absolute shadow-2xl ${positions[i]}`}>
                <BookCover book={book} size="L" eager={i === 0} />
              </div>
            )
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="container-page absolute inset-x-0 bottom-6 flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.category}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${slide.category}`}
                aria-current={i === index}
                className="group grid h-11 w-12 place-items-center"
              >
                <span
                  className={`h-1 w-full transition-colors ${i === index ? 'bg-ink' : 'bg-ink/20 group-hover:bg-ink/40'}`}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className="grid size-11 place-items-center bg-white hover:bg-ink hover:text-white">
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next slide" className="grid size-11 place-items-center bg-white hover:bg-ink hover:text-white">
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function SectionHeading({ title, children }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <h2 className="section-title">{title}</h2>
      {children && <p className="mt-3 text-ink-soft">{children}</p>}
    </div>
  )
}

function FeaturedBook({ book }) {
  const { add } = useCart()

  return (
    <section className="mt-24 bg-surface">
      <div className="container-page grid items-center gap-10 py-16 md:grid-cols-[2fr_3fr]">
        <Link to={`/books/${book.id}`} className="mx-auto w-full max-w-64" tabIndex={-1} aria-hidden="true">
          <BookCover book={book} size="L" className="shadow-2xl" />
        </Link>
        <div>
          <p className="kicker">Book of the month</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            <Link to={`/books/${book.id}`} className="hover:text-brand-strong">
              {book.title}
            </Link>
          </h2>
          <p className="mt-2 text-ink-soft">
            {book.authorName} · {publishedYear(book.publishedDate)}
          </p>
          {book.description && <p className="mt-5 max-w-xl text-lg text-ink-soft">{book.description}</p>}
          <p className="mt-6 text-3xl font-bold text-brand-strong">{formatPrice(book.price)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => add(book)} className="btn-solid px-10">
              Add to cart
            </button>
            <Link to={`/books/${book.id}`} className="btn-ghost">
              Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoryGrid({ categories, books }) {
  const withBooks = categories.filter((c) => c.bookCount > 0).sort((a, b) => b.bookCount - a.bookCount)
  if (withBooks.length === 0) return null
  const [lead, ...rest] = withBooks

  const coverFor = (category) => books.find((b) => b.categoryId === category.id)

  return (
    <section className="container-page mt-24">
      <SectionHeading title="Browse by Category">
        From timeless classics to far-future science fiction, pick a shelf and start reading.
      </SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <CategoryTile category={lead} book={coverFor(lead)} large />
        {rest.slice(0, 4).map((category) => (
          <CategoryTile key={category.id} category={category} book={coverFor(category)} />
        ))}
      </div>
      {rest.length > 4 && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {rest.slice(4).map((category) => (
            <Link key={category.id} to={`/shop?category=${category.id}`} className="btn-ghost normal-case tracking-normal">
              {category.name} <span className="text-muted">({category.bookCount})</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function CategoryTile({ category, book, large = false }) {
  return (
    <Link
      to={`/shop?category=${category.id}`}
      className={`group relative flex overflow-hidden bg-surface p-6 transition-colors duration-200 hover:bg-surface-strong ${
        large ? 'min-h-80 sm:col-span-2 lg:row-span-2' : 'min-h-44'
      }`}
    >
      <div className="relative z-10 flex max-w-[60%] flex-col">
        <span className="kicker text-xs">{category.bookCount} books</span>
        <span className={`mt-2 font-extrabold uppercase leading-tight ${large ? 'text-3xl sm:text-4xl' : 'text-xl'}`}>
          {category.name}
        </span>
        {large && category.description && <span className="mt-3 text-ink-soft">{category.description}</span>}
        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-brand-strong">
          Shop now <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
      {book && (
        <div
          aria-hidden="true"
          className={`absolute shadow-xl transition-transform duration-300 group-hover:-translate-y-2 ${
            large ? '-right-4 bottom-0 w-44 translate-y-8 rotate-6 sm:w-56' : 'right-4 -bottom-6 w-24 rotate-6'
          }`}
        >
          <BookCover book={book} size={large ? 'L' : 'M'} />
        </div>
      )}
    </Link>
  )
}

function AuthorsStrip({ authors }) {
  const top = [...authors].sort((a, b) => b.bookCount - a.bookCount).slice(0, 6)
  if (top.length === 0) return null

  return (
    <section className="container-page mt-24">
      <SectionHeading title="Meet the Authors">The writers behind the books on our shelves.</SectionHeading>
      <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {top.map((author) => (
          <li key={author.id}>
            <Link to={`/authors/${author.id}`} className="group flex flex-col items-center text-center">
              <span className="grid size-24 place-items-center rounded-full bg-brand-tint text-2xl font-bold text-brand-deep transition-colors duration-200 group-hover:bg-brand-strong group-hover:text-white">
                {author.firstName[0]}
                {author.lastName[0]}
              </span>
              <span className="mt-3 font-semibold group-hover:text-brand-strong">{authorFullName(author)}</span>
              <span className="text-sm text-muted">
                {author.bookCount} {author.bookCount === 1 ? 'book' : 'books'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Home() {
  const { data, error, loading, reload } = useApi(() =>
    Promise.all([booksApi.list(), categoriesApi.list(), authorsApi.list()]).then(([books, categories, authors]) => ({
      books,
      categories,
      authors,
    })),
  )

  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState error={error} onRetry={reload} />
      </div>
    )
  }

  const books = data?.books ?? []
  const newest = [...books]
    .filter((b) => b.publishedDate)
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
    .slice(0, 8)
  const featured = books.find((b) => b.title === 'The Left Hand of Darkness') ?? newest[0]

  return (
    <>
      {loading ? <div className="min-h-[min(80dvh,640px)] animate-pulse bg-surface" /> : <Hero books={books} />}

      <section className="container-page mt-20">
        <SectionHeading title="New Arrivals">
          The most recently published titles in the store, from modern history to contemporary fiction.
        </SectionHeading>
        {loading ? (
          <LoadingGrid />
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {newest.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link to="/shop" className="btn-outline px-10">
            View more
          </Link>
        </div>
      </section>

      {!loading && featured && <FeaturedBook book={featured} />}
      {!loading && <CategoryGrid categories={data.categories} books={books} />}
      {!loading && <AuthorsStrip authors={data.authors} />}
    </>
  )
}
