import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid book ID.'
    })
  }

  try {
    await db.deleteBook(id)
    setResponseStatus(event, 204)
    return null
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Book not found.'
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
