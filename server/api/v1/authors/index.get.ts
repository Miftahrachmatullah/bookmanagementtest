import { db } from '../../../utils/db'
import { buildPaginatedResponse } from '../../../utils/paginate'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string || '1')
  const perPage = parseInt(query.per_page as string || '10')
  const search = (query.search as string || '').trim().toLowerCase()

  const authors = await db.getAuthors()
  const books = await db.getBooks()

  // Compute total books dynamically per author and map to the response
  const authorsWithBookCount = authors.map(author => {
    const totalBooks = books.filter(b => b.author_id === author.id).length
    return {
      ...author,
      total_books: totalBooks
    }
  })

  let filtered = authorsWithBookCount
  if (search) {
    filtered = authorsWithBookCount.filter(a => 
      a.name.toLowerCase().includes(search) || 
      a.email.toLowerCase().includes(search)
    )
  }

  return buildPaginatedResponse(
    filtered,
    page,
    perPage,
    '/api/v1/authors',
    { search }
  )
})
