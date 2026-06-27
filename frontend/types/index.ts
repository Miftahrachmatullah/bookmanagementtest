export interface Author {
  id: number
  name: string
  email: string
  birth_date: string
  bio?: string
  books_count?: number
  books?: Book[]
  created_at?: string
  updated_at?: string
}

export interface Book {
  id: number
  author_id: number
  author?: Author
  title: string
  isbn: string
  published_year: number
  description?: string
  created_at?: string
  updated_at?: string
}

export interface PaginationMeta {
  current_page: number
  from: number
  last_page: number
  path: string
  per_page: number
  to: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiValidationError {
  message: string
  errors: Record<string, string[]>
}

export interface Toast {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'info' | 'warning'
}
