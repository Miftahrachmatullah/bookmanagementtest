import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid author ID.'
    })
  }

  try {
    await db.deleteAuthor(id)
    setResponseStatus(event, 204)
    return null
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Author not found.'
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
