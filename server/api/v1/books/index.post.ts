import { db } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const { body, bookCover } = await parseRequestBody(event)

  const errors: Record<string, string[]> = {}

  // Title validation
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    errors.title = ['The title field is required.']
  } else if (body.title.length > 255) {
    errors.title = ['The title may not be greater than 255 characters.']
  }

  // Author validation
  if (body.author_id === undefined || body.author_id === null || body.author_id === '') {
    errors.author_id = ['The author field is required.']
  } else {
    const authorId = parseInt(body.author_id)
    if (isNaN(authorId)) {
      errors.author_id = ['The selected author is invalid.']
    } else {
      const author = await db.getAuthorById(authorId)
      if (!author) {
        errors.author_id = ['The selected author does not exist.']
      }
    }
  }

  // ISBN validation
  if (!body.isbn || typeof body.isbn !== 'string' || !body.isbn.trim()) {
    errors.isbn = ['The ISBN field is required.']
  } else {
    const isbnClean = body.isbn.replace(/[- ]/g, '')
    const isbnRegex = /^(?=(?:\D*\d){13}\D*$)[\d-]+$/
    if (!isbnRegex.test(body.isbn) || isbnClean.length !== 13) {
      errors.isbn = ['ISBN format must be 13 digits with hyphens.']
    }
  }

  // Published Year validation
  const currentYear = new Date().getFullYear()
  if (body.published_year === undefined || body.published_year === null || body.published_year === '') {
    errors.published_year = ['The published year field is required.']
  } else {
    const year = parseInt(body.published_year)
    if (isNaN(year) || year < 1000 || year > currentYear) {
      errors.published_year = [`The published year must be between 1000 and ${currentYear}.`]
    }
  }

  // Status validation
  const validStatuses = ['AVAILABLE', 'LOANED', 'RESERVED']
  if (!body.status || typeof body.status !== 'string' || !body.status.trim()) {
    errors.status = ['The status field is required.']
  } else if (!validStatuses.includes(body.status.toUpperCase())) {
    errors.status = ['The selected status is invalid.']
  }

  // Description validation
  if (body.description && typeof body.description === 'string' && body.description.length > 2000) {
    errors.description = ['The description may not be greater than 2000 characters.']
  }

  if (Object.keys(errors).length > 0) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Unprocessable Entity',
      data: {
        message: 'The given data was invalid.',
        errors
      }
    })
  }

  try {
    let cover_url: string | null = null
    if (bookCover) {
      cover_url = await saveBookCover(bookCover)
    }

    const newBook = await db.createBook({
      title: body.title.trim(),
      author_id: parseInt(body.author_id),
      isbn: body.isbn.trim(),
      published_year: parseInt(body.published_year),
      status: body.status.toUpperCase() as 'AVAILABLE' | 'LOANED' | 'RESERVED',
      genre: body.genre ? body.genre.trim() : 'Fiction',
      description: (body.description || '').trim(),
      cover_url
    })
    setResponseStatus(event, 201)
    return { data: newBook }
  } catch (error: any) {
    if (error.message === 'ISBN_EXISTS') {
      throw createError({
        statusCode: 422,
        statusMessage: 'Unprocessable Entity',
        data: {
          message: 'The given data was invalid.',
          errors: {
            isbn: ['The ISBN has already been taken.']
          }
        }
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error'
    })
  }
})
