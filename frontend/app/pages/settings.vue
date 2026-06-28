<script setup lang="ts">
import { ref } from 'vue'
import { Database, RefreshCw, AlertCircle, Info, ShieldCheck } from 'lucide-vue-next'
import BaseButton from '~/components/base/BaseButton.vue'
import { useToast } from '~/composables/useToast'

const toast = useToast()
const loading = ref(false)

const handleResetDb = async () => {
  loading.value = true
  try {
    const config = useRuntimeConfig()
    await $fetch(`${config.public.apiBase}/reset`, { method: 'POST' })
    toast.success('Database Reset', 'The library database has been restored to its original seeded state.')
  } catch (error) {
    toast.danger('Reset Failed', 'There was a system error trying to reset the database.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-screen">
    <!-- Page Header -->
    <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 select-none">
      <h1 class="text-[24px] font-bold text-slate-900 tracking-tight leading-none">Settings</h1>
      
      <!-- Profile Avatar -->
      <div class="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold text-sm flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-200">
        AD
      </div>
    </header>

    <!-- Page Content -->
    <div class="p-6 space-y-6 flex-1 max-w-3xl">
      <!-- Section: System Information -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2 select-none">
          <Info class="w-4 h-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900 leading-none">System Information</h2>
        </div>
        <div class="p-5 space-y-4">
          <div class="grid grid-cols-3 gap-4 text-sm font-normal">
            <span class="text-slate-500 font-medium">Application Name</span>
            <span class="col-span-2 text-slate-900 font-semibold">BookManager Admin Console</span>

            <span class="text-slate-500 font-medium">Software Version</span>
            <span class="col-span-2 text-slate-900 font-mono text-xs">v1.0.0</span>

            <span class="text-slate-500 font-medium">Framework & Tech</span>
            <span class="col-span-2 text-slate-700">Nuxt 4.4, Vue 3.5, Tailwind CSS 3.4</span>

            <span class="text-slate-500 font-medium">Architecture</span>
            <span class="col-span-2 text-slate-700">Clean architecture with file-based JSON persistence</span>
          </div>
        </div>
      </div>

      <!-- Section: Database Management -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2 select-none">
          <Database class="w-4 h-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900 leading-none">Database Administration</h2>
        </div>
        <div class="p-5 space-y-5">
          <p class="text-sm text-slate-600 font-normal leading-relaxed">
            Manage files, indexes, and seeded data tables. Use the database reset below to clear new mutations and restore the application data back to the default 15 authors and 10 books.
          </p>

          <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-semibold text-amber-800 leading-none">Caution: Database Mutation</p>
              <p class="text-xs text-amber-700 mt-1 font-normal leading-relaxed">
                Resetting the database is irreversible. All custom authors and books created during testing will be permanently deleted and replaced with seed values.
              </p>
            </div>
          </div>

          <div class="pt-2 flex gap-3">
            <BaseButton 
              variant="danger" 
              :loading="loading" 
              @click="handleResetDb"
            >
              <RefreshCw class="w-4 h-4" />
              <span>Reset Database</span>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Section: Safety & Controls -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-2 select-none">
          <ShieldCheck class="w-4 h-4 text-blue-600" />
          <h2 class="text-sm font-semibold text-slate-900 leading-none">Access Controls</h2>
        </div>
        <div class="p-5">
          <p class="text-sm text-slate-600 font-normal leading-relaxed">
            Authentication is currently disabled according to requirements. Session rules and administrator privileges are managed in memory.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
