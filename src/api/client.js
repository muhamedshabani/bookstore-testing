// Thin wrapper around fetch for the BookStore API.
// Errors carry the HTTP status and, for 400s, the field errors from ASP.NET's ValidationProblem.

export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Could not reach the BookStore API. Is the backend running?')
  }

  if (response.status === 204) return null

  // A non-JSON success (e.g. a static host serving index.html for /api) means there is no API behind us.
  if (response.ok && !response.headers.get('content-type')?.includes('json')) {
    throw new ApiError(0, 'Could not reach the BookStore API. Is the backend running?')
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 404) throw new ApiError(404, 'Not found.')
    const fieldErrors = {}
    for (const [key, messages] of Object.entries(data?.errors ?? {})) {
      // ASP.NET returns PascalCase keys; forms use camelCase.
      fieldErrors[key.charAt(0).toLowerCase() + key.slice(1)] = messages.join(' ')
    }
    const message = data?.message ?? data?.title ?? `Request failed (${response.status}).`
    throw new ApiError(response.status, message, fieldErrors)
  }

  return data
}

const resource = (name) => ({
  list: () => request(`/${name}`),
  get: (id) => request(`/${name}/${id}`),
  create: (dto) => request(`/${name}`, { method: 'POST', body: dto }),
  update: (id, dto) => request(`/${name}/${id}`, { method: 'PUT', body: dto }),
  remove: (id) => request(`/${name}/${id}`, { method: 'DELETE' }),
})

export const booksApi = resource('books')

export const authorsApi = {
  ...resource('authors'),
  books: (id) => request(`/authors/${id}/books`),
}

export const categoriesApi = {
  ...resource('categories'),
  books: (id) => request(`/categories/${id}/books`),
}
