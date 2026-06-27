import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'info' | 'warning' | 'danger'
  title: string
  message: string
  progress?: number // percentage (0 - 100)
  duration?: number
}

// Pre-seed the 4 specified toasts from the prompt for presentation purposes
const toasts = ref<Toast[]>([
  {
    id: -1,
    type: 'success',
    title: 'Author added',
    message: 'Gabriel García Márquez has been added successfully.',
    progress: 85,
    duration: 0
  },
  {
    id: -2,
    type: 'info',
    title: 'Changes saved',
    message: "Elena Ferrante's profile has been updated.",
    progress: 55,
    duration: 0
  },
  {
    id: -3,
    type: 'danger',
    title: 'Book deleted',
    message: "'Silent Patterns' has been permanently removed.",
    progress: 25,
    duration: 0
  },
  {
    id: -4,
    type: 'danger',
    title: 'Something went wrong',
    message: 'Failed to save changes. Please try again.',
    progress: 0,
    duration: 0
  }
])

let toastId = 0

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = ++toastId
    const newToast = { ...toast, id, progress: toast.progress ?? 100 }
    toasts.value.push(newToast)
    
    const duration = toast.duration || 3000
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }
  }

  const dismissToast = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const success = (title: string, message: string) => {
    addToast({ type: 'success', title, message })
  }

  const info = (title: string, message: string) => {
    addToast({ type: 'info', title, message })
  }

  const warning = (title: string, message: string) => {
    addToast({ type: 'warning', title, message })
  }

  const danger = (title: string, message: string) => {
    addToast({ type: 'danger', title, message })
  }

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    info,
    warning,
    danger
  }
}
