import { Link } from 'react-router-dom'
import { authorsApi } from '../api/client'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { useApi } from '../hooks/useApi'
import { authorFullName } from '../lib/format'

export default function Authors() {
  const { data, error, loading, reload } = useApi(() => authorsApi.list())

  return (
    <div className="container-page py-12">
      <header className="mb-10 max-w-2xl">
        <p className="kicker">Authors</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Meet the Authors</h1>
        <p className="mt-3 text-ink-soft">The writers behind every book in the store.</p>
      </header>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading ? (
        <Spinner label="Loading authors" />
      ) : data.length === 0 ? (
        <EmptyState title="No authors yet" />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((author) => (
            <li key={author.id}>
              <Link
                to={`/authors/${author.id}`}
                className="group flex h-full gap-5 border border-line p-6 transition-colors duration-200 hover:border-ink"
              >
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-tint text-xl font-bold text-brand-deep transition-colors duration-200 group-hover:bg-brand-strong group-hover:text-white">
                  {author.firstName[0]}
                  {author.lastName[0]}
                </span>
                <span className="flex flex-col">
                  <span className="font-bold group-hover:text-brand-strong">{authorFullName(author)}</span>
                  <span className="text-sm text-muted">
                    {author.bookCount} {author.bookCount === 1 ? 'book' : 'books'}
                  </span>
                  {author.biography && <span className="mt-2 line-clamp-3 text-sm text-ink-soft">{author.biography}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
