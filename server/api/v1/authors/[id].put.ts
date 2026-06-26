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

  const { body, profilePhoto } = await parseRequestBody(event)

  const errors: Record<string, string[]> = {}

  // Name validation
  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      errors.name = ['The name field is required.']
    } else if (body.name.length > 255) {
      errors.name = ['The name may not be greater than 255 characters.']
    }
  }

  // Email validation
  if (body.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof body.email !== 'string' || !body.email.trim()) {
      errors.email = ['The email field is required.']
    } else if (!emailRegex.test(body.email)) {
      errors.email = ['The email must be a valid email address.']
    }
  }

  // Birth Date validation
  if (body.birth_date !== undefined) {
    if (typeof body.birth_date !== 'string' || !body.birth_date.trim()) {
      errors.birth_date = ['The birth date field is required.']
    } else {
      const bdate = new Date(body.birth_date)
      if (isNaN(bdate.getTime())) {
        errors.birth_date = ['The birth date is not a valid date.']
      } else {
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (bdate > today) {
          errors.birth_date = ['The birth date cannot be in the future.']
        }
      }
    }
  }

  // Bio validation
  if (body.bio !== undefined) {
    if (body.bio && typeof body.bio === 'string' && body.bio.length > 1000) {
      errors.bio = ['The bio may not be greater than 1000 characters.']
    }
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
    let profile_photo_url: string | null | undefined = undefined
    if (body.profile_photo_remove === '1') {
      profile_photo_url = null
    } else if (profilePhoto) {
      profile_photo_url = await saveProfilePhoto(profilePhoto)
    }

    const updatedAuthor = await db.updateAuthor(id, {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.email !== undefined && { email: body.email.trim() }),
      ...(body.birth_date !== undefined && { birth_date: body.birth_date.trim() }),
      ...(body.bio !== undefined && { bio: (body.bio || '').trim() }),
      ...(profile_photo_url !== undefined && { profile_photo_url })
    })
    return { data: updatedAuthor }
  } catch (error: any) {
    if (error.message === 'EMAIL_EXISTS') {
      throw createError({
        statusCode: 422,
        statusMessage: 'Unprocessable Entity',
        data: {
          message: 'The given data was invalid.',
          errors: {
            email: ['The email has already been taken.']
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
