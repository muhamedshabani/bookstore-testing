import { ChevronLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { authorsApi } from '../api/client'
import BookCard from '../components/BookCard'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { useApi } from '../hooks/useApi'
import { authorFullName } from '../lib/format'
import NotFound from './NotFound'

export default function AuthorDetail() {
  const { id } = useParams()
  const { data, error, loading, reload } = useApi(
    () => Promise.all([authorsApi.get(id), authorsApi.books(id)]).then(([author, books]) => ({ author, books })),
    [id],
  )

  if (loading) return <Spinner label="Loading author" />
  if (error?.status === 404) return <NotFound what="author" />
  if (error) {
    return (
      <div className="container-page py-16">
        <ErrorState error={error} onRetry={reload} />
      </div>
    )
  }

  const { author, books } = data

  return (
    <div className="container-page py-10">
      <Link to="/authors" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden="true" /> All authors
      </Link>

      <header className="mt-6 flex flex-col gap-6 bg-surface p-8 sm:flex-row sm:items-center sm:p-12">
        <span className="grid size-28 shrink-0 place-items-center rounded-full bg-brand-strong text-4xl font-bold text-white">
          {author.firstName[0]}
          {author.lastName[0]}
        </span>
        <div>
          <p className="kicker">Author</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{authorFullName(author)}</h1>
          {author.biography && <p className="mt-3 max-w-2xl text-ink-soft">{author.biography}</p>}
        </div>
      </header>

      <section className="mt-14">
        <h2 className="section-title mb-8">
          Books <span className="text-muted">({books.length})</span>
        </h2>
        {books.length === 0 ? (
          <EmptyState title="No books yet">This author doesn't have any books in the store.</EmptyState>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
