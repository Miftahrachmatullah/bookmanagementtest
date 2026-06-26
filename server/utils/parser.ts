import { readMultipartFormData, readBody, getHeader } from 'h3'
import { promises as fs } from 'fs'
import { join } from 'path'

export interface ParsedRequest {
  body: Record<string, any>
  profilePhoto: { filename: string; type: string; data: Buffer } | null
  bookCover: { filename: string; type: string; data: Buffer } | null
}

export async function parseRequestBody(event: any): Promise<ParsedRequest> {
  const contentType = getHeader(event, 'content-type') || ''
  
  if (contentType.includes('multipart/form-data')) {
    const multipartData = await readMultipartFormData(event)
    const body: Record<string, any> = {}
    let profilePhoto: { filename: string; type: string; data: Buffer } | null = null
    let bookCover: { filename: string; type: string; data: Buffer } | null = null

    if (multipartData) {
      for (const part of multipartData) {
        if (!part.name) continue
        if (part.filename) {
          if (part.name === 'profile_photo') {
            profilePhoto = {
              filename: part.filename,
              type: part.type || 'image/jpeg',
              data: part.data
            }
          } else if (part.name === 'cover_image') {
            bookCover = {
              filename: part.filename,
              type: part.type || 'image/jpeg',
              data: part.data
            }
          }
        } else {
          body[part.name] = part.data.toString('utf-8')
        }
      }
    }
    return { body, profilePhoto, bookCover }
  }
  
  const body = await readBody(event) || {}
  return { body, profilePhoto: null, bookCover: null }
}

export async function saveProfilePhoto(file: { filename: string; type: string; data: Buffer }): Promise<string> {
  const uploadDir = join(process.cwd(), 'public/uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  
  const ext = file.filename.split('.').pop() || 'jpg'
  const newFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const filePath = join(uploadDir, newFilename)
  
  await fs.writeFile(filePath, file.data)
  return `/uploads/${newFilename}`
}

export async function saveBookCover(file: { filename: string; type: string; data: Buffer }): Promise<string> {
  const uploadDir = join(process.cwd(), 'public/uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  
  const ext = file.filename.split('.').pop() || 'jpg'
  const newFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const filePath = join(uploadDir, newFilename)
  
  await fs.writeFile(filePath, file.data)
  return `/uploads/${newFilename}`
}
