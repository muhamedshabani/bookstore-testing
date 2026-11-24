import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { CartProvider } from './context/CartContext'
import Admin from './pages/admin/Admin'
import AuthorDetail from './pages/AuthorDetail'
import Authors from './pages/Authors'
import BookDetail from './pages/BookDetail'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Shop from './pages/Shop'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="books/:id" element={<BookDetail />} />
            <Route path="authors" element={<Authors />} />
            <Route path="authors/:id" element={<AuthorDetail />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
