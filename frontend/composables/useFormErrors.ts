import type { ApiValidationError } from '~/types'

export function useFormErrors() {
  const errors = ref<Record<string, string[]>>({})
  const errorMessage = ref<string | null>(null)

  const handleApiError = (err: any) => {
    if (err?.errors) {
      errors.value = err.errors
      errorMessage.value = err.message || 'Please check the form for errors.'
    } else if (err?.message) {
      errorMessage.value = err.message
      errors.value = {}
    } else {
      errorMessage.value = 'An unexpected error occurred.'
      errors.value = {}
    }
  }

  const clearErrors = () => {
    errors.value = {}
    errorMessage.value = null
  }

  const getError = (field: string): string | null => {
    return errors.value[field]?.[0] || null
  }

  const hasError = (field: string): boolean => {
    return !!errors.value[field]?.length
  }

  return {
    errors,
    errorMessage,
    handleApiError,
    clearErrors,
    getError,
    hasError,
  }
}
