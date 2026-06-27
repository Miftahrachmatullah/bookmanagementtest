<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import BaseButton from '../base/BaseButton.vue'

interface Props {
  type: 'authors-search' | 'books-empty' | 'books-search' | 'authors-empty'
}

defineProps<Props>()
defineEmits(['action'])
</script>

<template>
  <div class="py-16 flex flex-col items-center justify-center text-center gap-4 select-none">
    <!-- SVG ILLUSTRATION (80x80px, stroke-only, rounded caps) -->
    <div class="w-20 h-20 text-slate-300 flex items-center justify-center shrink-0">
      <!-- Person Silhouette with Small Book in Front (Authors Search / Empty) -->
      <svg 
        v-if="type === 'authors-search' || type === 'authors-empty'"
        width="80" 
        height="80" 
        viewBox="0 0 80 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor" 
        stroke-width="1.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <!-- Person silhouette outline -->
        <path d="M40 38C47.1797 38 53 32.1797 53 25C53 17.8203 47.1797 12 40 12C32.8203 12 27 17.8203 27 25C27 32.1797 32.8203 38 40 38Z" />
        <path d="M18 64C18 51.85 27.85 42 40 42C44.3 42 48.27 43.23 51.62 45.36" />
        
        <!-- Book in front -->
        <rect x="46" y="48" width="22" height="20" rx="2" fill="white" />
        <path d="M51 53H63" />
        <path d="M51 58H59" />
        <path d="M51 63H61" />
      </svg>

      <!-- Open Book (Books Empty / Search) -->
      <svg 
        v-else
        width="80" 
        height="80" 
        viewBox="0 0 80 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor" 
        stroke-width="1.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <!-- Open pages shape -->
        <path d="M12 60V22C12 20 20 18 40 24C60 18 68 20 68 22V60C68 58 60 56 40 62C20 56 12 58 12 60Z" />
        <path d="M40 24V62" />
        
        <!-- Subtle page line outlines -->
        <path d="M20 32C26 30 32 31 34 32" />
        <path d="M20 40C26 38 32 39 34 40" />
        <path d="M20 48C26 46 32 47 34 48" />
        <path d="M60 32C54 30 48 31 46 32" />
        <path d="M60 40C54 38 48 39 46 40" />
        <path d="M60 48C54 46 48 47 46 48" />
      </svg>
    </div>

    <!-- Heading -->
    <h3 class="text-base font-medium text-slate-700 leading-none mt-2">
      <template v-if="type === 'authors-search'">No authors found</template>
      <template v-else-if="type === 'authors-empty'">No authors yet</template>
      <template v-else-if="type === 'books-empty'">No books yet</template>
      <template v-else-if="type === 'books-search'">No books found</template>
    </h3>

    <!-- Subtext -->
    <p class="text-sm text-slate-400 font-normal leading-relaxed max-w-xs px-4">
      <template v-if="type === 'authors-search'">No authors match your search. Try a different keyword.</template>
      <template v-else-if="type === 'authors-empty'">Add your first author to get started with the library.</template>
      <template v-else-if="type === 'books-empty'">Add your first book to get started with the library.</template>
      <template v-else-if="type === 'books-search'">No books match your search. Try a different keyword or filter.</template>
    </p>

    <!-- Action Button -->
    <div class="mt-2">
      <BaseButton 
        variant="primary" 
        @click="$emit('action')"
      >
        <Plus class="w-4 h-4 shrink-0" />
        <span>
          <template v-if="type === 'authors-search' || type === 'authors-empty'">Add Author</template>
          <template v-else>Add Book</template>
        </span>
      </BaseButton>
    </div>
  </div>
</template>
