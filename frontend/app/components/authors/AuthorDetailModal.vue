<script setup lang="ts">
import { X, Mail, Calendar, BookOpen, Lock } from 'lucide-vue-next'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'

interface Props {
  show: boolean
  authorId: number | null
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const author = ref<any>(null)
const books = ref<any[]>([])
const loading = ref(false)

watch(() => props.show, async (newVal) => {
  if (newVal && props.authorId) {
    loading.value = true
    try {
      const config = useRuntimeConfig()
      const BASE = config.public.apiBase
      const [authorData, booksData] = await Promise.all([
        $fetch<any>(`${BASE}/authors/${props.authorId}`),
        $fetch<any>(`${BASE}/books`, {
          params: {
            author_id: props.authorId,
            per_page: 100
          }
        })
      ])
      author.value = authorData.data
      books.value = booksData.data
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  } else {
    author.value = null
    books.value = []
  }
})

// Avatar initials helper
const getAvatarStyle = (name: string) => {
  const colors = [
    'bg-blue-600 text-white',
    'bg-purple-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-sky-600 text-white',
    'bg-indigo-600 text-white'
  ]
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = colors[Math.abs(hash) % colors.length]
  return { initials, color }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const d = String(date.getDate()).padStart(2, '0')
  const m = months[date.getMonth()]
  const y = date.getFullYear()
  return `${d} ${m} ${y}`
}
</script>

<template>
  <BaseModal
    :show="show"
    title="Author Details"
    @close="emit('close')"
  >
    <div v-if="loading" class="py-8 flex flex-col items-center justify-center space-y-3 animate-pulse">
      <div class="w-16 h-16 bg-slate-200 rounded-full" />
      <div class="h-4 w-32 bg-slate-200 rounded" />
      <div class="h-3 w-48 bg-slate-100 rounded" />
    </div>

    <div v-else-if="author" class="space-y-5 text-left">
      <!-- Profile Header -->
      <div class="flex items-center gap-4 border-b border-slate-100 pb-4">
        <!-- Avatar image -->
        <div v-if="author.profile_photo_url" class="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0">
          <img :src="author.profile_photo_url" class="w-full h-full object-cover" alt="Avatar" />
        </div>
        <div 
          v-else
          class="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl border border-slate-200 shrink-0"
          :class="getAvatarStyle(author.name).color"
        >
          {{ getAvatarStyle(author.name).initials }}
        </div>

        <div>
          <h3 class="text-lg font-semibold text-slate-900 leading-tight">{{ author.name }}</h3>
          <p class="text-sm text-slate-500 mt-1">Author Profile</p>
        </div>
      </div>

      <!-- Details List -->
      <div class="space-y-3.5">
        <!-- Email -->
        <div class="flex items-center gap-3 text-sm text-slate-600">
          <Mail class="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <span class="font-medium">Email:</span>
          <span>{{ author.email }}</span>
        </div>

        <!-- Birth Date -->
        <div class="flex items-center gap-3 text-sm text-slate-600">
          <Calendar class="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <span class="font-medium">Birth Date:</span>
          <span>{{ formatDate(author.birth_date) }}</span>
        </div>
      </div>

      <!-- Bio -->
      <div class="space-y-1.5 border-t border-slate-100 pt-4">
        <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Biography</h4>
        <p class="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
          {{ author.bio || 'No biography details provided.' }}
        </p>
      </div>

      <!-- Books Written Section -->
      <div class="space-y-2 border-t border-slate-100 pt-4">
        <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Books Written</h4>
        <ul v-if="books.length > 0" class="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
          <li v-for="book in books" :key="book.id" class="py-2 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- Book Cover Thumbnail 24x32px or BookOpen -->
              <div class="w-6 h-8 rounded overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                <img v-if="book.cover_url" :src="book.cover_url" class="w-full h-full object-cover" alt="Cover" />
                <BookOpen v-else class="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div class="min-w-0">
                <span class="text-sm font-medium text-slate-900 block truncate leading-tight">{{ book.title }}</span>
                <span class="text-xs text-slate-400">{{ book.published_year }} &bull; {{ book.isbn }}</span>
              </div>
            </div>
            <!-- Status Badge -->
            <span 
              v-if="book.status === 'AVAILABLE'"
              class="inline-flex items-center bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
            >
              AVAILABLE
            </span>
            <span 
              v-else-if="book.status === 'LOANED'"
              class="inline-flex items-center bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase shrink-0"
            >
              LOANED
            </span>
            <span 
              v-else-if="book.status === 'RESERVED'"
              class="inline-flex items-center gap-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase shrink-0"
            >
              <Lock class="w-2.5 h-2.5 shrink-0" />
              RESERVED
            </span>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-500 italic">No books cataloged for this author.</p>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')" class="w-full md:w-auto">
        Close
      </BaseButton>
    </template>
  </BaseModal>
</template>
