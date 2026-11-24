const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatPrice = (value) => currency.format(value)

export const publishedYear = (date) => (date ? new Date(date).getFullYear() : null)

export const authorFullName = (author) => `${author.firstName} ${author.lastName}`
