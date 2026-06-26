import { db } from '../../../utils/db'
import { buildPaginatedResponse } from '../../../utils/paginate'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string || '1')
  const perPage = parseInt(query.per_page as string || '10')
  const authorId = query.author_id ? parseInt(query.author_id as string) : undefined
  const search = (query.search as string || '').trim().toLowerCase()

  const books = await db.getBooks()
  const authors = await db.getAuthors()

  // Eager load author details into each book
  const booksWithAuthor = books.map(book => {
    const author = authors.find(a => a.id === book.author_id)
    return {
      ...book,
      author: author ? { id: author.id, name: author.name, email: author.email } : null
    }
  })

  let filtered = booksWithAuthor

  // Filter by Author ID if provided
  if (authorId && !isNaN(authorId)) {
    filtered = filtered.filter(b => b.author_id === authorId)
  }

  // Filter by Search (Title or ISBN) if provided
  if (search) {
    filtered = filtered.filter(b => 
      b.title.toLowerCase().includes(search) || 
      b.isbn.toLowerCase().replace(/[- ]/g, '').includes(search.replace(/[- ]/g, ''))
    )
  }

  // Order books by ID descending so newly created ones show first, or keep order. Let's keep order (which is by ID or creation)
  return buildPaginatedResponse(
    filtered,
    page,
    perPage,
    '/api/v1/books',
    { author_id: authorId, search }
  )
})
