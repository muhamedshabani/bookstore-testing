import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/authors', label: 'Authors' },
  { to: '/admin', label: 'Admin' },
]

const navClass = ({ isActive }) =>
  `relative py-2 text-sm font-medium transition-colors hover:text-brand-strong ${
    isActive ? 'text-brand-strong' : 'text-ink'
  }`

export default function Header() {
  const { count, open } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const submitSearch = (event) => {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('q').trim()
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop')
    setSearchOpen(false)
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          className="-ml-2 grid size-11 place-items-center md:hidden"
        >
          {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>

        <Link to="/" className="text-xl font-extrabold tracking-tight">
          BookStore<span className="text-brand">.</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-10 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="-mr-2 flex items-center">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search books"
            aria-expanded={searchOpen}
            className="hidden size-11 place-items-center hover:text-brand-strong sm:grid"
          >
            <Search className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={open}
            aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
            className="relative grid size-11 place-items-center hover:text-brand-strong"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute top-1.5 right-1 grid min-w-5 place-items-center rounded-full bg-brand-strong px-1 text-xs font-bold leading-5 text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line">
          <form onSubmit={submitSearch} role="search" className="container-page flex gap-3 py-3">
            <label htmlFor="header-search" className="sr-only">
              Search by title or author
            </label>
            <input id="header-search" name="q" type="search" autoFocus placeholder="Search by title or author" className="field-input" />
            <button type="submit" className="btn-solid shrink-0">
              Search
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line md:hidden">
          <form onSubmit={submitSearch} role="search" className="container-page pt-4">
            <label htmlFor="mobile-search" className="sr-only">
              Search by title or author
            </label>
            <input id="mobile-search" name="q" type="search" placeholder="Search by title or author" className="field-input" />
          </form>
          <ul className="container-page py-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center text-base font-medium ${isActive ? 'text-brand-strong' : 'text-ink'}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
