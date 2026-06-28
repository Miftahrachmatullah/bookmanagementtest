import { ref } from 'vue'
import type { Book, PaginatedResponse } from '~/types'

// Global in-memory dummy database for books
export const dummyBooks = ref<Book[]>([
  { id: 1, author_id: 1, title: "One Hundred Years of Solitude", isbn: "978-0-06-088328-7", published_year: 1967, description: "The multi-generational story of the Buendía family.", status: "AVAILABLE" as any },
  { id: 2, author_id: 2, title: "Norwegian Wood", isbn: "978-0-375-70402-4", published_year: 1987, description: "A nostalgic novel of loss and burgeoning sexuality.", status: "LOANED" as any },
  { id: 3, author_id: 3, title: "Pride and Prejudice", isbn: "978-0-14-143951-8", published_year: 1813, description: "A romantic novel of manners written by Jane Austen.", status: "RESERVED" as any },
  { id: 4, author_id: 4, title: "1984", isbn: "978-0-451-52493-5", published_year: 1949, description: "A dystopian social science fiction novel.", status: "AVAILABLE" as any }
])

export function useBooks() {
  const config = useRuntimeConfig()
  const BASE = config.public.apiBase

  const books = ref<Book[]>([])
  const meta = ref<any>(null)
  const loading = ref(false)
  const error = ref<any>(null)
  const isFallbackMode = ref(false)

  async function fetchBooks(params: Record<string, any> = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<PaginatedResponse<Book>>(`${BASE}/books`, {
        params,
        headers: { Accept: 'application/json' },
      })
      books.value = data.data
      meta.value = data.meta
      isFallbackMode.value = false
    } catch (err: any) {
      const status  = err?.response?.status ?? err?.status
      const message = err?.data?.message ?? err?.message ?? 'An error occurred connecting to the backend.'
      error.value   = message
      console.error(`[composable] Error ${status}:`, message)

      console.warn('Backend API connection failed, switching to local dummy books database fallback.')
      isFallbackMode.value = true

      // Local search filtering
      let list = [...dummyBooks.value]
      if (params.search) {
        const q = params.search.toLowerCase()
        list = list.filter(b => b.title.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q))
      }
      if (params.author_id) {
        const authorId = Number(params.author_id)
        list = list.filter(b => b.author_id === authorId)
      }

      // Local pagination simulation
      const page = params.page || 1
      const perPage = params.per_page || 10
      const total = list.length
      const lastPage = Math.ceil(total / perPage)
      const offset = (page - 1) * perPage
      const paginated = list.slice(offset, offset + perPage)

      books.value = paginated
      meta.value = {
        current_page: page,
        from: offset + 1,
        last_page: lastPage,
        path: '',
        per_page: perPage,
        to: Math.min(offset + perPage, total),
        total: total
      }
    } finally {
      loading.value = false
    }
  }

  async function createBook(payload: any) {
    const data = await $fetch<{ data: Book }>(`${BASE}/books`, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' },
    })
    dummyBooks.value.unshift(data.data)
    return data
  }

  async function updateBook(id: number, payload: any) {
    const isMultipart = payload instanceof FormData
    if (isMultipart) {
      payload.append('_method', 'PUT')
    }

    const data = await $fetch<{ data: Book }>(`${BASE}/books/${id}`, {
      method: isMultipart ? 'POST' : 'PUT',
      body: payload,
      headers: { Accept: 'application/json' },
    })
    const idx = dummyBooks.value.findIndex(b => b.id === id)
    if (idx !== -1) dummyBooks.value[idx] = data.data
    return data
  }

  async function deleteBook(id: number) {
    await $fetch(`${BASE}/books/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })
    dummyBooks.value = dummyBooks.value.filter(b => b.id !== id)
  }

  return {
    books,
    meta,
    loading,
    error,
    isFallbackMode,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook
  }
}

