<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  type: 'button',
  disabled: false,
  loading: false
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 font-medium text-sm select-none transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    :class="{
      'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 rounded-lg px-4 py-2': variant === 'primary',
      'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400 rounded-lg px-4 py-2': variant === 'secondary',
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 rounded-lg px-4 py-2': variant === 'danger'
    }"
  >
    <svg v-if="loading" class="animate-spin -ml-0.5 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <slot v-else />
  </button>
</template>
