import { ref } from 'vue'

export function useAuthors() {
  const authors = ref<any[]>([])
  const meta = ref<any>(null)
  const loading = ref(false)
  const error = ref<any>(null)

  const fetchAuthors = async (params: { page?: number; per_page?: number; search?: string }) => {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      if (params.page) query.append('page', String(params.page))
      if (params.per_page) query.append('per_page', String(params.per_page || 10))
      if (params.search) query.append('search', params.search)

      const data = await $fetch<any>(`/api/v1/authors?${query.toString()}`)
      authors.value = data.data
      meta.value = data.meta
    } catch (err: any) {
      error.value = err
      authors.value = []
      meta.value = null
    } finally {
      loading.value = false
    }
  }

  const createAuthor = async (formData: FormData) => {
    return await $fetch<any>('/api/v1/authors', {
      method: 'POST',
      body: formData
    })
  }

  const updateAuthor = async (id: number, formData: FormData) => {
    return await $fetch<any>(`/api/v1/authors/${id}`, {
      method: 'PUT',
      body: formData
    })
  }

  const deleteAuthor = async (id: number) => {
    return await $fetch<any>(`/api/v1/authors/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    authors,
    meta,
    loading,
    error,
    fetchAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor
  }
}
