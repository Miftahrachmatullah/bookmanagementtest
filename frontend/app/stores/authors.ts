import { defineStore } from 'pinia'
import type { Author, PaginationMeta, PaginatedResponse } from '~/types'

export const useAuthorStore = defineStore('authors', {
  state: () => ({
    authors: [] as Author[],
    currentAuthor: null as Author | null,
    meta: null as PaginationMeta | null,
    loading: false,
    error: null as any | null,
  }),

  actions: {
    async fetchAuthors(params: { page?: number; per_page?: number; search?: string } = {}) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const response = await $api.get<PaginatedResponse<Author>>('/authors', { params })
        this.authors = response.data.data
        this.meta = response.data.meta
      } catch (err: any) {
        this.error = err.response?.data || err.message
        console.error('Failed to fetch authors:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchAuthor(id: number) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const response = await $api.get<{ data: Author }>(`/authors/${id}`)
        this.currentAuthor = response.data.data
        return this.currentAuthor
      } catch (err: any) {
        this.error = err.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async createAuthor(payload: Partial<Author>) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const response = await $api.post<{ data: Author }>('/authors', payload)
        this.authors.unshift(response.data.data)
        return response.data.data
      } catch (err: any) {
        this.error = err.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateAuthor(id: number, payload: Partial<Author>) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const response = await $api.put<{ data: Author }>(`/authors/${id}`, payload)
        const index = this.authors.findIndex(a => a.id === id)
        if (index !== -1) {
          this.authors[index] = response.data.data
        }
        if (this.currentAuthor?.id === id) {
          this.currentAuthor = response.data.data
        }
        return response.data.data
      } catch (err: any) {
        this.error = err.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteAuthor(id: number) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        await $api.delete(`/authors/${id}`)
        this.authors = this.authors.filter(a => a.id !== id)
      } catch (err: any) {
        this.error = err.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
