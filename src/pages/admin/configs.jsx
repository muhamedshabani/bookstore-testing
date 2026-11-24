import { Link } from 'react-router-dom'
import { authorsApi, booksApi, categoriesApi } from '../../api/client'
import BookCover from '../../components/BookCover'
import { authorFullName, formatPrice, publishedYear } from '../../lib/format'

const blankToNull = (value) => (value === '' || value === undefined ? null : value)

const countBadge = (count) => (
  <span className={`inline-flex min-w-8 justify-center px-2 py-0.5 font-semibold ${count ? 'bg-brand-tint text-brand-deep' : 'bg-surface text-muted'}`}>
    {count}
  </span>
)

export const booksConfig = {
  key: 'books',
  singular: 'Book',
  plural: 'Books',
  api: booksApi,
  load: () =>
    Promise.all([booksApi.list(), authorsApi.list(), categoriesApi.list()]).then(([records, authors, categories]) => ({
      records,
      authors,
      categories,
    })),
  label: (b) => b.title,
  searchText: (b) => `${b.title} ${b.authorName} ${b.categoryName} ${b.isbn}`,
  columns: [
    {
      label: 'Book',
      render: (b) => (
        <div className="flex items-center gap-3">
          <BookCover book={b} size="S" className="w-9 shrink-0" />
          <div>
            <Link to={`/books/${b.id}`} className="font-semibold hover:text-brand-strong">
              {b.title}
            </Link>
            <div className="font-mono text-xs text-muted">{b.isbn}</div>
          </div>
        </div>
      ),
    },
    { label: 'Author', render: (b) => b.authorName },
    { label: 'Category', render: (b) => b.categoryName },
    { label: 'Year', render: (b) => publishedYear(b.publishedDate) ?? '—' },
    { label: 'Price', className: 'text-right', render: (b) => formatPrice(b.price) },
  ],
  fields: ({ authors, categories }) => [
    { name: 'title', label: 'Title', required: true, maxLength: 200 },
    { name: 'isbn', label: 'ISBN', required: true, maxLength: 20, hint: 'Must be unique, e.g. 9780547928227.' },
    {
      name: 'authorId',
      label: 'Author',
      type: 'select',
      required: true,
      options: [...authors]
        .sort((a, b) => a.lastName.localeCompare(b.lastName))
        .map((a) => ({ value: String(a.id), label: authorFullName(a) })),
    },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'select',
      required: true,
      options: categories.map((c) => ({ value: String(c.id), label: c.name })),
    },
    { name: 'price', label: 'Price (USD)', type: 'number', step: '0.01', min: 0, required: true },
    { name: 'publishedDate', label: 'Published date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea', maxLength: 2000 },
  ],
  toForm: (b) => ({
    title: b?.title ?? '',
    isbn: b?.isbn ?? '',
    authorId: b ? String(b.authorId) : '',
    categoryId: b ? String(b.categoryId) : '',
    price: b ? String(b.price) : '',
    publishedDate: b?.publishedDate ?? '',
    description: b?.description ?? '',
  }),
  toDto: (v) => ({
    title: v.title.trim(),
    isbn: v.isbn.trim(),
    authorId: Number(v.authorId),
    categoryId: Number(v.categoryId),
    price: Number(v.price),
    publishedDate: blankToNull(v.publishedDate),
    description: blankToNull(v.description.trim()),
  }),
}

export const authorsConfig = {
  key: 'authors',
  singular: 'Author',
  plural: 'Authors',
  api: authorsApi,
  load: () => authorsApi.list().then((records) => ({ records })),
  label: authorFullName,
  searchText: (a) => `${authorFullName(a)} ${a.biography ?? ''}`,
  columns: [
    {
      label: 'Name',
      render: (a) => (
        <Link to={`/authors/${a.id}`} className="font-semibold hover:text-brand-strong">
          {authorFullName(a)}
        </Link>
      ),
    },
    { label: 'Biography', className: 'max-w-md', render: (a) => <span className="line-clamp-2 text-ink-soft">{a.biography ?? '—'}</span> },
    { label: 'Books', className: 'text-right', render: (a) => countBadge(a.bookCount) },
  ],
  fields: () => [
    { name: 'firstName', label: 'First name', required: true, maxLength: 100 },
    { name: 'lastName', label: 'Last name', required: true, maxLength: 100 },
    { name: 'biography', label: 'Biography', type: 'textarea', maxLength: 2000 },
  ],
  toForm: (a) => ({ firstName: a?.firstName ?? '', lastName: a?.lastName ?? '', biography: a?.biography ?? '' }),
  toDto: (v) => ({ firstName: v.firstName.trim(), lastName: v.lastName.trim(), biography: blankToNull(v.biography.trim()) }),
}

export const categoriesConfig = {
  key: 'categories',
  singular: 'Category',
  plural: 'Categories',
  api: categoriesApi,
  load: () => categoriesApi.list().then((records) => ({ records })),
  label: (c) => c.name,
  searchText: (c) => `${c.name} ${c.description ?? ''}`,
  columns: [
    {
      label: 'Name',
      render: (c) => (
        <Link to={`/shop?category=${c.id}`} className="font-semibold hover:text-brand-strong">
          {c.name}
        </Link>
      ),
    },
    { label: 'Description', className: 'max-w-md', render: (c) => <span className="text-ink-soft">{c.description ?? '—'}</span> },
    { label: 'Books', className: 'text-right', render: (c) => countBadge(c.bookCount) },
  ],
  fields: () => [
    { name: 'name', label: 'Name', required: true, maxLength: 100, hint: 'Must be unique.' },
    { name: 'description', label: 'Description', type: 'textarea', maxLength: 500 },
  ],
  toForm: (c) => ({ name: c?.name ?? '', description: c?.description ?? '' }),
  toDto: (v) => ({ name: v.name.trim(), description: blankToNull(v.description.trim()) }),
}
