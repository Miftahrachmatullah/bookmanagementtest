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

  const author = await db.getAuthorById(id)
  if (!author) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: 'Author not found.'
    })
  }

  return { data: author }
})
