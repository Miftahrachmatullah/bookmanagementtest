import { defineStore } from 'pinia'
import type { Book, PaginationMeta, PaginatedResponse } from '~/types'

export const useBookStore = defineStore('books', {
  state: () => ({
    books: [] as Book[],
    currentBook: null as Book | null,
    meta: null as PaginationMeta | null,
    loading: false,
    error: null as any | null,
  }),

  actions: {
    async fetchBooks(params: { page?: number; per_page?: number; search?: string; author_id?: number } = {}) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const response = await $api.get<PaginatedResponse<Book>>('/books', { params })
        this.books = response.data.data
        this.meta = response.data.meta
      } catch (err: any) {
        this.error = err.response?.data || err.message
        console.error('Failed to fetch books:', err)
      } finally {
        this.loading = false
      }
    },

    async createBook(payload: Partial<Book>) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const response = await $api.post<{ data: Book }>('/books', payload)
        this.books.unshift(response.data.data)
        return response.data.data
      } catch (err: any) {
        this.error = err.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateBook(id: number, payload: Partial<Book>) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        const response = await $api.put<{ data: Book }>(`/books/${id}`, payload)
        const index = this.books.findIndex(b => b.id === id)
        if (index !== -1) {
          this.books[index] = response.data.data
        }
        if (this.currentBook?.id === id) {
          this.currentBook = response.data.data
        }
        return response.data.data
      } catch (err: any) {
        this.error = err.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteBook(id: number) {
      this.loading = true
      this.error = null
      const { $api } = useNuxtApp()

      try {
        await $api.delete(`/books/${id}`)
        this.books = this.books.filter(b => b.id !== id)
      } catch (err: any) {
        this.error = err.response?.data || err.message
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
