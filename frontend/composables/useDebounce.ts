import { useDebounceFn } from '@vueuse/core'

export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number = 300): T {
  return useDebounceFn(fn, delay) as unknown as T
}
