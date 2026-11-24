import { AlertCircle, BookX, RotateCw } from 'lucide-react'

export function LoadingGrid({ count = 8 }) {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-surface" />
          <div className="mt-3 h-3 w-1/3 bg-surface" />
          <div className="mt-2 h-4 w-3/4 bg-surface" />
          <div className="mt-2 h-3 w-1/4 bg-surface" />
        </div>
      ))}
    </div>
  )
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-line border-t-brand-strong" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 border border-line px-6 py-12 text-center">
      <AlertCircle className="size-8 text-danger" aria-hidden="true" />
      <p className="max-w-md text-ink-soft">{error?.message ?? 'Something went wrong.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost">
          <RotateCw className="size-4" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, children }) {
  return (
    <div className="flex flex-col items-center gap-3 border border-dashed border-line px-6 py-14 text-center">
      <BookX className="size-8 text-muted" aria-hidden="true" />
      <p className="font-semibold text-ink">{title}</p>
      {children && <div className="max-w-md text-ink-soft">{children}</div>}
    </div>
  )
}
