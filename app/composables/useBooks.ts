import { ref } from 'vue'

export function useBooks() {
  const books = ref<any[]>([])
  const meta = ref<any>(null)
  const loading = ref(false)
  const error = ref<any>(null)

  const fetchBooks = async (params: { page?: number; per_page?: number; search?: string; author_id?: string | number | null }) => {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      if (params.page) query.append('page', String(params.page))
      if (params.per_page) query.append('per_page', String(params.per_page || 10))
      if (params.search) query.append('search', params.search)
      if (params.author_id) query.append('author_id', String(params.author_id))

      const data = await $fetch<any>(`/api/v1/books?${query.toString()}`)
      books.value = data.data
      meta.value = data.meta
    } catch (err: any) {
      error.value = err
      books.value = []
      meta.value = null
    } finally {
      loading.value = false
    }
  }

  const createBook = async (formData: FormData) => {
    return await $fetch<any>('/api/v1/books', {
      method: 'POST',
      body: formData
    })
  }

  const updateBook = async (id: number, formData: FormData) => {
    return await $fetch<any>(`/api/v1/books/${id}`, {
      method: 'PUT',
      body: formData
    })
  }

  const deleteBook = async (id: number) => {
    return await $fetch<any>(`/api/v1/books/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    books,
    meta,
    loading,
    error,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook
  }
}
