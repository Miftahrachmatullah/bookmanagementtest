import { ref } from 'vue'
import type { Author, PaginatedResponse } from '~/types'

// Global in-memory dummy database
export const dummyAuthors = ref<Author[]>([
  { id: 1, name: "Gabriel García Márquez", email: "gabriel@macondo.co", birth_date: "1927-03-06", bio: "Colombian novelist, short-story writer, screenwriter, and journalist.", books_count: 2 },
  { id: 2, name: "Haruki Murakami", email: "haruki@murakami.jp", birth_date: "1949-01-12", bio: "Japanese writer. His books and stories have been bestsellers in Japan as well as internationally.", books_count: 1 },
  { id: 3, name: "Jane Austen", email: "jane@austen.org", birth_date: "1775-12-16", bio: "English novelist known primarily for her six major novels.", books_count: 1 },
  { id: 4, name: "George Orwell", email: "george@orwell.net", birth_date: "1903-06-25", bio: "English novelist, essayist, journalist and critic.", books_count: 1 },
  { id: 5, name: "J.K. Rowling", email: "jk@rowling.co.uk", birth_date: "1965-07-31", bio: "British author, best known for writing the Harry Potter fantasy series.", books_count: 0 }
])

export function useAuthors() {
  const config = useRuntimeConfig()
  const BASE = config.public.apiBase

  const authors = ref<Author[]>([])
  const meta = ref<any>(null)
  const loading = ref(false)
  const error = ref<any>(null)
  const isFallbackMode = ref(false)

  async function fetchAuthors(params: Record<string, any> = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<PaginatedResponse<Author>>(`${BASE}/authors`, {
        params,
        headers: { Accept: 'application/json' },
      })
      authors.value = data.data
      meta.value = data.meta
      isFallbackMode.value = false
    } catch (err: any) {
      const status  = err?.response?.status ?? err?.status
      const message = err?.data?.message ?? err?.message ?? 'An error occurred connecting to the backend.'
      error.value   = message
      console.error(`[composable] Error ${status}:`, message)

      console.warn('Backend API connection failed, switching to local dummy database fallback.')
      isFallbackMode.value = true
      
      // Local search filtering
      let list = [...dummyAuthors.value]
      if (params.search) {
        const q = params.search.toLowerCase()
        list = list.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
      }

      // Local pagination simulation
      const page = params.page || 1
      const perPage = params.per_page || 10
      const total = list.length
      const lastPage = Math.ceil(total / perPage)
      const offset = (page - 1) * perPage
      const paginated = list.slice(offset, offset + perPage)

      authors.value = paginated
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

  async function createAuthor(payload: any) {
    const data = await $fetch<{ data: Author }>(`${BASE}/authors`, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' },
    })
    // Sync local DB
    dummyAuthors.value.unshift(data.data)
    return data
  }

  async function updateAuthor(id: number, payload: any) {
    const isMultipart = payload instanceof FormData
    if (isMultipart) {
      payload.append('_method', 'PUT')
    }

    const data = await $fetch<{ data: Author }>(`${BASE}/authors/${id}`, {
      method: isMultipart ? 'POST' : 'PUT',
      body: payload,
      headers: { Accept: 'application/json' },
    })
    // Sync local DB
    const idx = dummyAuthors.value.findIndex(a => a.id === id)
    if (idx !== -1) dummyAuthors.value[idx] = data.data
    return data
  }

  async function deleteAuthor(id: number) {
    await $fetch(`${BASE}/authors/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    })
    dummyAuthors.value = dummyAuthors.value.filter(a => a.id !== id)
  }

  return {
    authors,
    meta,
    loading,
    error,
    isFallbackMode,
    fetchAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor
  }
}

