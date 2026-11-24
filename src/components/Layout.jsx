import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Header from './Header'

export default function Layout() {
  const { pathname } = useLocation()

  // Start each page at the top, like a normal page load.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
