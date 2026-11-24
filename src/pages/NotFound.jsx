import { Link } from 'react-router-dom'

export default function NotFound({ what = 'page' }) {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="kicker">404</p>
      <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">We couldn't find that {what}</h1>
      <p className="mt-3 max-w-md text-ink-soft">It may have been removed, or the link is wrong.</p>
      <Link to="/shop" className="btn-outline mt-8">
        Back to the shop
      </Link>
    </div>
  )
}
