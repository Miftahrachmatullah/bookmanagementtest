<script setup lang="ts">
interface Props {
  rows?: number
  columns?: number
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 6
})
</script>

<template>
  <tbody class="divide-y divide-slate-100 select-none">
    <tr v-for="i in rows" :key="i" class="border-b border-slate-100">
      <!-- Avatar / Cover -->
      <td class="px-6 py-3.5">
        <div class="w-9 h-[52px] bg-slate-200 rounded animate-pulse" />
      </td>

      <!-- Name / Title -->
      <td class="px-6 py-3.5">
        <div class="flex flex-col">
          <div class="h-4 w-36 bg-slate-200 rounded animate-pulse" />
          <div class="h-3 w-24 bg-slate-100 rounded mt-1.5 animate-pulse" />
        </div>
      </td>

      <!-- Email / Author -->
      <td class="px-6 py-3.5">
        <div class="h-4 w-44 bg-slate-200 rounded animate-pulse" />
      </td>

      <!-- Birth Date / ISBN -->
      <td class="px-6 py-3.5">
        <div class="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      </td>

      <!-- Books Count / Published Year -->
      <td class="px-6 py-3.5 text-center">
        <div class="h-4 w-12 bg-slate-200 rounded animate-pulse mx-auto" />
      </td>

      <!-- Status Column (v-if columns is 7) -->
      <td v-if="columns === 7" class="px-6 py-3.5 text-center">
        <div class="h-5 w-20 bg-slate-200 rounded-full animate-pulse mx-auto" />
      </td>

      <!-- Actions -->
      <td class="px-6 py-3.5 text-right">
        <div class="flex gap-1.5 justify-end">
          <div class="h-7 w-7 bg-slate-200 rounded-md animate-pulse" />
          <div class="h-7 w-7 bg-slate-200 rounded-md animate-pulse" />
        </div>
      </td>
    </tr>
  </tbody>
</template>
