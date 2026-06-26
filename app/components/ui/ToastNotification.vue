<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { CheckCircle2, Trash2, XCircle, X } from 'lucide-vue-next'

const { toasts, dismissToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup
        enter-active-class="transform transition duration-300 ease-out"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <!-- Single Toast -->
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-start gap-3 w-[320px] bg-white rounded-lg shadow-md border-l-4 px-4 py-3 pb-4 pointer-events-auto relative overflow-hidden"
          :class="{
            'border-l-green-500': toast.type === 'success',
            'border-l-blue-500': toast.type === 'info',
            'border-l-red-500': toast.type === 'danger'
          }"
        >
          <!-- Status Icon -->
          <div class="shrink-0 mt-0.5">
            <!-- TOAST 1 (Success) / TOAST 2 (Info) CheckCircle2 -->
            <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-green-600" />
            <CheckCircle2 v-else-if="toast.type === 'info'" class="w-5 h-5 text-blue-600" />
            <!-- TOAST 3 (Danger / Deleted) Trash2 -->
            <Trash2 v-else-if="toast.type === 'danger' && toast.title.toLowerCase().includes('delete')" class="w-5 h-5 text-red-600" />
            <!-- TOAST 4 (Error / Wrong) XCircle -->
            <XCircle v-else class="w-5 h-5 text-red-600" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pr-1">
            <p class="text-sm font-semibold text-slate-900 leading-none">
              {{ toast.title }}
            </p>
            <p class="text-xs text-slate-500 mt-1 font-normal leading-relaxed">
              {{ toast.message }}
            </p>
          </div>

          <!-- Close button -->
          <button
            @click="dismissToast(toast.id)"
            class="p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors shrink-0"
            aria-label="Close"
          >
            <X class="w-3.5 h-3.5" />
          </button>

          <!-- Thin Progress Bar (h-0.5, absolute bottom-0 left-0) -->
          <div 
            v-if="toast.progress !== undefined && toast.progress > 0"
            class="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-150"
            :class="{
              'bg-green-500': toast.type === 'success',
              'bg-blue-500': toast.type === 'info',
              'bg-red-500': toast.type === 'danger'
            }"
            :style="{ width: `${toast.progress}%` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
