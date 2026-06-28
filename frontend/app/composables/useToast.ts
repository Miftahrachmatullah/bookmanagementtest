import { ref } from 'vue'

export interface Toast {
  id: number
  type: 'success' | 'info' | 'warning' | 'danger'
  title: string
  message: string
  progress?: number // percentage (0 - 100)
  duration?: number
}

const toasts = ref<Toast[]>([])

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
