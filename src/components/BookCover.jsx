import { useState } from 'react'

// Muted backgrounds for the fallback cover, picked from the title so each book keeps its colour.
const FALLBACK_TONES = [
  'bg-[#3d4a3f] text-[#f1ece2]',
  'bg-[#7a4b33] text-[#f6ece6]',
  'bg-[#2f3e52] text-[#e9eef5]',
  'bg-[#5b3a4a] text-[#f5e9ef]',
  'bg-[#8a6d3b] text-[#fbf5e8]',
  'bg-[#3b3b3b] text-[#f2f2f2]',
]

function toneFor(title) {
  let hash = 0
  for (const char of title) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return FALLBACK_TONES[hash % FALLBACK_TONES.length]
}

// Shows the real cover from Open Library (looked up by ISBN). If there is none,
// falls back to a typographic cover so the grid never shows a broken image.
export default function BookCover({ book, size = 'M', className = '', eager = false }) {
  const [failed, setFailed] = useState(false)
  const src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg?default=false`

  return (
    <div className={`relative aspect-[2/3] overflow-hidden bg-surface-strong ${className}`}>
      {!failed ? (
        <img
          src={src}
          alt={`Cover of ${book.title}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`Cover of ${book.title}`}
          className={`flex h-full w-full flex-col justify-between p-[8%] ${toneFor(book.title)}`}
        >
          <span className="h-px w-8 bg-current opacity-60" />
          <span className="text-[clamp(0.8rem,2.2vw,1.35rem)] font-bold leading-tight">{book.title}</span>
          <span className="text-[clamp(0.6rem,1.4vw,0.8rem)] font-medium uppercase tracking-widest opacity-80">
            {book.authorName}
          </span>
        </div>
      )}
    </div>
  )
}
