import { defineStore } from 'pinia'
import type { Toast } from '~/types'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Toast[],
  }),

  actions: {
    addToast(toast: Omit<Toast, 'id'>) {
      const id = Math.random().toString(36).substring(2, 9)
      this.toasts.push({ id, ...toast })

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        this.removeToast(id)
      }, 4000)
    },

    removeToast(id: string) {
      this.toasts = this.toasts.filter(t => t.id !== id)
    }
  }
})
