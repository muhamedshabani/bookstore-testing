import { useState } from 'react'
import { Link } from 'react-router-dom'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { to: '/shop', label: 'All books' },
      { to: '/shop?sort=newest', label: 'New arrivals' },
      { to: '/authors', label: 'Authors' },
    ],
  },
  {
    title: 'Manage',
    links: [
      { to: '/admin', label: 'Books' },
      { to: '/admin?tab=authors', label: 'Authors' },
      { to: '/admin?tab=categories', label: 'Categories' },
    ],
  },
]

const YEAR = new Date().getFullYear()

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="mt-24 bg-ink text-[#d4d4d4]">
      <div className="container-page grid gap-8 border-b border-white/10 py-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Stay in the loop</h2>
          <p className="mt-2 max-w-md text-sm">New arrivals and reading lists, once a month. No spam.</p>
        </div>
        {subscribed ? (
          <p role="status" className="font-semibold text-white lg:justify-self-end">
            Thanks! You're on the list.
          </p>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSubscribed(true)
            }}
            className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-lg lg:justify-self-end"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              className="field-input flex-1 border-transparent"
            />
            <button type="submit" className="btn-solid">
              Subscribe
            </button>
          </form>
        )}
      </div>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link to="/" className="text-xl font-extrabold text-white">
            BookStore<span className="text-brand">.</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            Classics, science fiction, mysteries and more, from authors who shaped how we read.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">{column.title}</h2>
            <ul className="mt-4 space-y-1">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="inline-flex min-h-9 items-center text-sm hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-page border-t border-white/10 py-6 text-sm">
        © {YEAR} BookStore. Design inspired by the Flatlogic ecommerce template.
      </div>
    </footer>
  )
}
