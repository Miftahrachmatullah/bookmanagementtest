<!-- frontend/app/components/ui/Pagination.vue -->
<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

// ─── Props ────────────────────────────────────────────────
const props = defineProps<{
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}>()

// ─── Emits ────────────────────────────────────────────────
const emit = defineEmits<{
  change: [page: number]
}>()

// ─── Computed ─────────────────────────────────────────────

/** Hitung range item yang sedang ditampilkan */
const rangeStart = computed(() =>
  (props.meta.current_page - 1) * props.meta.per_page + 1
)

const rangeEnd = computed(() =>
  Math.min(props.meta.current_page * props.meta.per_page, props.meta.total)
)

/**
 * Buat array nomor halaman dengan logika ellipsis.
 * Contoh: [1, 2, 3, '...', 10] or [1, '...', 4, 5, 6, '...', 10]
 */
const pageNumbers = computed<(number | '...')[]>(() => {
  const { current_page: current, last_page: last } = props.meta
  const delta = 1 // Jumlah halaman di kiri/kanan current page

  if (last <= 7) {
    // Jika total halaman sedikit, tampilkan semua
    return Array.from({ length: last }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []
  const left  = Math.max(2, current - delta)
  const right = Math.min(last - 1, current + delta)

  pages.push(1)

  if (left > 2) pages.push('...')

  for (let i = left; i <= right; i++) {
    pages.push(i)
  }

  if (right < last - 1) pages.push('...')

  pages.push(last)

  return pages
})

// ─── Methods ──────────────────────────────────────────────
function goToPage(page: number | '...') {
  if (page === '...') return
  if (page < 1 || page > props.meta.last_page) return
  if (page === props.meta.current_page) return
  emit('change', page)
}

function prevPage() {
  if (props.meta.current_page > 1) {
    emit('change', props.meta.current_page - 1)
  }
}

function nextPage() {
  if (props.meta.current_page < props.meta.last_page) {
    emit('change', props.meta.current_page + 1)
  }
}
</script>

<template>
  <div
    v-if="meta.total > 0"
    class="px-4 py-3 flex items-center justify-between border-t border-slate-100"
  >
    <!-- Kiri: Info range -->
    <p class="text-xs text-slate-500">
      Showing
      <span class="font-medium text-slate-700">{{ rangeStart }}</span>
      –
      <span class="font-medium text-slate-700">{{ rangeEnd }}</span>
      of
      <span class="font-medium text-slate-700">{{ meta.total }}</span>
      results
    </p>

    <!-- Kanan: Tombol navigasi halaman -->
    <div class="flex items-center gap-1">

      <!-- Tombol Previous -->
      <button
        @click="prevPage"
        :disabled="meta.current_page === 1"
        class="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500
               hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed
               transition-colors duration-100"
        aria-label="Previous page"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>

      <!-- Nomor Halaman -->
      <template v-for="(page, index) in pageNumbers" :key="index">

        <!-- Ellipsis -->
        <span
          v-if="page === '...'"
          class="flex items-center justify-center w-8 h-8 text-sm text-slate-400
                 select-none"
        >
          ···
        </span>

        <!-- Tombol Halaman -->
        <button
          v-else
          @click="goToPage(page)"
          :aria-current="page === meta.current_page ? 'page' : undefined"
          class="flex items-center justify-center w-8 h-8 rounded-lg text-sm
                 font-medium transition-colors duration-100"
          :class="page === meta.current_page
            ? 'bg-blue-600 text-white cursor-default'
            : 'text-slate-600 hover:bg-slate-100'"
        >
          {{ page }}
        </button>

      </template>

      <!-- Tombol Next -->
      <button
        @click="nextPage"
        :disabled="meta.current_page === meta.last_page"
        class="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500
               hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed
               transition-colors duration-100"
        aria-label="Next page"
      >
        <ChevronRight class="w-4 h-4" />
      </button>

    </div>
  </div>
</template>
