import { SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authorsApi, booksApi, categoriesApi } from '../api/client'
import BookCard from '../components/BookCard'
import { EmptyState, ErrorState, LoadingGrid } from '../components/States'
import { useApi } from '../hooks/useApi'
import { authorFullName } from '../lib/format'

const SORTS = {
  title: { label: 'Title A–Z', compare: (a, b) => a.title.localeCompare(b.title) },
  newest: { label: 'Newest first', compare: (a, b) => (b.publishedDate ?? '').localeCompare(a.publishedDate ?? '') },
  oldest: { label: 'Oldest first', compare: (a, b) => (a.publishedDate ?? '9999').localeCompare(b.publishedDate ?? '9999') },
  'price-asc': { label: 'Price: low to high', compare: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', compare: (a, b) => b.price - a.price },
}

function FilterGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold uppercase tracking-wider">{legend}</legend>
      <div className="space-y-0.5">
        {[{ id: '', label: 'All', count: null }, ...options].map((option) => (
          <label key={option.id || 'all'} className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-ink-soft hover:text-ink">
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === String(option.id)}
              onChange={() => onChange(String(option.id))}
              className="size-4 accent-brand-strong"
            />
            <span className="flex-1">{option.label}</span>
            {option.count !== null && <span className="text-muted">{option.count}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { data, error, loading, reload } = useApi(() =>
    Promise.all([booksApi.list(), categoriesApi.list(), authorsApi.list()]).then(([books, categories, authors]) => ({
      books,
      categories,
      authors,
    })),
  )

  const query = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const author = params.get('author') ?? ''
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'title'

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    if (!data) return []
    const needle = query.trim().toLowerCase()
    return data.books
      .filter((b) => !category || String(b.categoryId) === category)
      .filter((b) => !author || String(b.authorId) === author)
      .filter(
        (b) =>
          !needle ||
          b.title.toLowerCase().includes(needle) ||
          b.authorName.toLowerCase().includes(needle) ||
          b.isbn.includes(needle),
      )
      .sort(SORTS[sort].compare)
  }, [data, query, category, author, sort])

  const activeCategory = data?.categories.find((c) => String(c.id) === category)
  const activeAuthor = data?.authors.find((a) => String(a.id) === author)
  const hasFilters = Boolean(query || category || author)

  const filters = data && (
    <div className="space-y-8">
      <FilterGroup
        legend="Category"
        name="category"
        value={category}
        onChange={(v) => setParam('category', v)}
        options={data.categories.map((c) => ({ id: c.id, label: c.name, count: c.bookCount }))}
      />
      <FilterGroup
        legend="Author"
        name="author"
        value={author}
        onChange={(v) => setParam('author', v)}
        options={[...data.authors]
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
          .map((a) => ({ id: a.id, label: authorFullName(a), count: a.bookCount }))}
      />
    </div>
  )

  return (
    <div className="container-page py-12">
      <header className="mb-10">
        <p className="kicker">Shop</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{activeCategory?.name ?? 'All Books'}</h1>
        {activeCategory?.description && <p className="mt-2 max-w-2xl text-ink-soft">{activeCategory.description}</p>}
      </header>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          {filters}
        </aside>

        <div>
          <div className="mb-6 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="shop-search" className="field-label">
                Search
              </label>
              <input
                id="shop-search"
                type="search"
                value={query}
                onChange={(e) => setParam('q', e.target.value)}
                placeholder="Title, author or ISBN"
                className="field-input"
              />
            </div>
            <div className="sm:w-56">
              <label htmlFor="shop-sort" className="field-label">
                Sort by
              </label>
              <select id="shop-sort" value={sort} onChange={(e) => setParam('sort', e.target.value)} className="field-input">
                {Object.entries(SORTS).map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls="mobile-filters"
              className="btn-ghost lg:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters
            </button>
          </div>

          {filtersOpen && (
            <div id="mobile-filters" className="mb-8 border border-line p-5 lg:hidden">
              {filters}
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
            <p aria-live="polite" className="text-ink-soft">
              {loading ? 'Loading books…' : `${results.length} ${results.length === 1 ? 'book' : 'books'}`}
            </p>
            {activeCategory && (
              <FilterChip label={activeCategory.name} onRemove={() => setParam('category', '')} />
            )}
            {activeAuthor && <FilterChip label={authorFullName(activeAuthor)} onRemove={() => setParam('author', '')} />}
            {query && <FilterChip label={`“${query}”`} onRemove={() => setParam('q', '')} />}
            {hasFilters && (
              <button type="button" onClick={() => setParams({}, { replace: true })} className="min-h-9 font-semibold text-brand-strong underline-offset-4 hover:underline">
                Clear all
              </button>
            )}
          </div>

          {error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : loading ? (
            <LoadingGrid count={6} />
          ) : results.length === 0 ? (
            <EmptyState title="No books match your filters">Try a different search, or clear the filters to see everything.</EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
              {results.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-surface py-1 pr-1 pl-3 font-medium">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove filter ${label}`} className="grid size-7 place-items-center hover:text-danger">
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </span>
  )
}
