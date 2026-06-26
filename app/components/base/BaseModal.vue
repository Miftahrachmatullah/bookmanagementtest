<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  show?: boolean
  title?: string
  maxWidthClass?: string // e.g. 'max-w-[480px]'
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: '',
  maxWidthClass: 'max-w-[480px]'
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-40 flex items-end md:items-center justify-center md:p-4">
      <!-- Backdrop with 40% black overlay -->
      <div 
        class="fixed inset-0 bg-black/40 transition-opacity duration-300 ease-out"
        @click="close"
      />

      <!-- Modal Card / Bottom Sheet on Mobile -->
      <div
        class="bg-white rounded-t-2xl md:rounded-xl shadow-xl w-full relative z-50 flex flex-col overflow-hidden max-h-[90vh] md:max-h-[85vh] transition-all duration-300 ease-out transform scale-100 opacity-100"
        :class="[maxWidthClass]"
        role="dialog"
        aria-modal="true"
      >
        <!-- Mobile Bottom Sheet Handle Bar -->
        <div class="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-2 block md:hidden shrink-0" />

        <!-- Modal Header -->
        <div class="flex items-center justify-between px-4 md:px-5 pt-2 md:pt-5 pb-0 md:pb-4 border-b border-transparent md:border-slate-200 bg-white shrink-0">
          <h2 class="text-base font-semibold text-slate-900 leading-none">
            <slot name="title">{{ title }}</slot>
          </h2>
          <button
            @click="close"
            class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-4 md:px-5 py-4 overflow-y-auto flex-1 space-y-4">
          <slot />
        </div>

        <!-- Modal Footer (stacked vertically on mobile, row on desktop) -->
        <div class="px-4 md:px-5 pb-6 md:pb-4 pt-4 border-t border-slate-200 flex flex-col-reverse md:flex-row md:justify-end gap-2 md:gap-3 bg-white shrink-0">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
