<script setup lang="ts">
import { Download } from 'lucide-vue-next'

defineProps<{
  title?: string
}>()

const emit = defineEmits(['click'])
</script>

<template>
  <button 
    @click="emit('click')"
    class="hidden md:block p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
    :title="title || 'Export CSV'"
  >
    <Download class="w-5 h-5" />
  </button>
</template>
