import { BookOpen, CheckCircle2, Library, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { authorsApi, booksApi, categoriesApi } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import { formatPrice } from '../../lib/format'
import EntityTab from './EntityTab'
import { authorsConfig, booksConfig, categoriesConfig } from './configs'

const TABS = [
  { key: 'books', label: 'Books', config: booksConfig },
  { key: 'authors', label: 'Authors', config: authorsConfig },
  { key: 'categories', label: 'Categories', config: categoriesConfig },
]

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 border border-line p-5">
      <span className="grid size-12 place-items-center bg-brand-tint text-brand-deep">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <div className="text-2xl font-bold">{value ?? '—'}</div>
        <div className="text-sm text-muted">{label}</div>
      </div>
    </div>
  )
}

export default function Admin() {
  const [params, setParams] = useSearchParams()
  const active = TABS.find((t) => t.key === params.get('tab')) ?? TABS[0]
  const tabRefs = useRef({})
  const [toast, setToast] = useState(null)

  const stats = useApi(() =>
    Promise.all([booksApi.list(), authorsApi.list(), categoriesApi.list()]).then(([books, authors, categories]) => ({
      books: books.length,
      authors: authors.length,
      categories: categories.length,
      value: books.reduce((sum, b) => sum + b.price, 0),
    })),
  )

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const selectTab = (key) => setParams(key === 'books' ? {} : { tab: key }, { replace: true })

  // Arrow keys move between tabs, as in the WAI-ARIA tabs pattern.
  const onTabKeyDown = (event) => {
    const index = TABS.indexOf(active)
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (!step) return
    const next = TABS[(index + step + TABS.length) % TABS.length]
    selectTab(next.key)
    tabRefs.current[next.key]?.focus()
  }

  return (
    <div className="container-page py-12">
      <header className="mb-10">
        <p className="kicker">Admin</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Manage the Store</h1>
        <p className="mt-2 text-ink-soft">Add, edit and remove books, authors and categories.</p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={BookOpen} label="Books" value={stats.data?.books} />
        <Stat icon={Users} label="Authors" value={stats.data?.authors} />
        <Stat icon={Library} label="Categories" value={stats.data?.categories} />
        <Stat icon={BookOpen} label="Catalogue value (1 of each)" value={stats.data && formatPrice(stats.data.value)} />
      </div>

      <div role="tablist" aria-label="Records" className="mb-8 flex gap-8 border-b border-line" onKeyDown={onTabKeyDown}>
        {TABS.map((tab) => {
          const selected = tab === active
          return (
            <button
              key={tab.key}
              ref={(el) => (tabRefs.current[tab.key] = el)}
              type="button"
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(tab.key)}
              className={`-mb-px min-h-12 border-b-2 text-sm font-semibold uppercase tracking-wider transition-colors ${
                selected ? 'border-brand-strong text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`panel-${active.key}`} aria-labelledby={`tab-${active.key}`}>
        <EntityTab key={active.key} config={active.config} onChanged={stats.reload} notify={setToast} />
      </div>

      <div aria-live="polite" className="fixed right-4 bottom-4 z-50">
        {toast && (
          <p className="flex items-center gap-2 bg-ink px-5 py-3 text-sm font-medium text-white shadow-lg motion-safe:animate-[fade-in_200ms_ease-out]">
            <CheckCircle2 className="size-4 text-[#6fd39b]" aria-hidden="true" /> {toast}
          </p>
        )}
      </div>
    </div>
  )
}
