<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Search, 
  RefreshCw, 
  SlidersHorizontal, 
  ChevronRight, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock,
  AlertCircle
} from 'lucide-vue-next'
import AuthorDetailModal from '~/components/authors/AuthorDetailModal.vue'
import { dummyAuthors } from '~/composables/useAuthors'
import { dummyBooks } from '~/composables/useBooks'

const toast = useToast()
const searchQuery = ref('')

const config = useRuntimeConfig()
const BASE = config.public.apiBase

// Stat Cards: Data Real dari API dengan fallback
const { data: authorsMeta, refresh: refreshAuthorsMeta } = await useAsyncData('authors-meta', async () => {
  try {
    return await $fetch<any>(`${BASE}/authors?per_page=1`)
  } catch (e) {
    return { meta: { total: dummyAuthors.value.length }, data: [] }
  }
})

const { data: booksMeta, refresh: refreshBooksMeta } = await useAsyncData('books-meta', async () => {
  try {
    return await $fetch<any>(`${BASE}/books?per_page=1`)
  } catch (e) {
    return { meta: { total: dummyBooks.value.length }, data: [] }
  }
})

const { data: circulationData, refresh: refreshCirculation } = await useAsyncData('circulation-books', async () => {
  try {
    return await $fetch<any>(`${BASE}/books?per_page=500`)
  } catch (e) {
    return { data: dummyBooks.value }
  }
})

const totalAuthors = computed(() => authorsMeta.value?.meta?.total ?? dummyAuthors.value.length)
const totalBooks = computed(() => booksMeta.value?.meta?.total ?? dummyBooks.value.length)
const loanedBooksCount = computed(() => {
  const list = circulationData.value?.data ?? dummyBooks.value
  return list.filter((b: any) => b.status === 'LOANED').length
})
const reservedBooksCount = computed(() => {
  const list = circulationData.value?.data ?? dummyBooks.value
  return list.filter((b: any) => b.status === 'RESERVED').length
})

// Recent Books: Fetch dari API dengan fallback
const { data: recentBooksData, refresh: refreshRecentBooks } = await useAsyncData('recent-books', async () => {
  try {
    return await $fetch<any>(`${BASE}/books?page=1&per_page=5`)
  } catch (e) {
    const mapped = dummyBooks.value.slice(0, 5).map(b => ({
      ...b,
      author: dummyAuthors.value.find(a => a.id === b.author_id)
    }))
    return { data: mapped }
  }
})
const recentBooks = computed(() => recentBooksData.value?.data ?? [])

// Recent Authors: Fetch dari API + Klik Detail dengan fallback
const { data: recentAuthorsData, refresh: refreshRecentAuthors } = await useAsyncData('recent-authors', async () => {
  try {
    return await $fetch<any>(`${BASE}/authors?page=1&per_page=5`)
  } catch (e) {
    return { data: dummyAuthors.value.slice(0, 5) }
  }
})
const recentAuthors = computed(() => recentAuthorsData.value?.data ?? [])

const selectedAuthorId = ref<number | null>(null)
const showAuthorDetail = ref(false)

function openAuthorDetail(authorId: number) {
  selectedAuthorId.value = authorId
  showAuthorDetail.value = true
}

const statsLoading = ref(false)
const booksLoading = ref(false)
const authorsLoading = ref(false)

const handleRefresh = async () => {
  statsLoading.value = true
  booksLoading.value = true
  authorsLoading.value = true
  try {
    await Promise.all([
      refreshAuthorsMeta(),
      refreshBooksMeta(),
      refreshCirculation(),
      refreshRecentBooks(),
      refreshRecentAuthors()
    ])
    toast.success('Data Refreshed', 'Latest catalog statistics have been successfully loaded.')
  } catch (err) {
    toast.danger('Refresh Failed', 'Unable to retrieve latest database statistics.')
  } finally {
    statsLoading.value = false
    booksLoading.value = false
    authorsLoading.value = false
  }
}

// Filter books and authors on search query (local fallback filtering)
const filteredRecentBooks = computed(() => {
  if (!searchQuery.value) return recentBooks.value
  const q = searchQuery.value.toLowerCase()
  return recentBooks.value.filter((b: any) => 
    b.title.toLowerCase().includes(q) || 
    (b.author?.name || '').toLowerCase().includes(q) ||
    (b.genre || '').toLowerCase().includes(q)
  )
})

const filteredRecentAuthors = computed(() => {
  if (!searchQuery.value) return recentAuthors.value
  const q = searchQuery.value.toLowerCase()
  return recentAuthors.value.filter((a: any) => a.name.toLowerCase().includes(q))
})

// Avatar Fallback logic (matching authors list page)
function getAvatarColor(name: string) {
  const colors = [
    { bg: 'bg-blue-100',   text: 'text-blue-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
    { bg: 'bg-green-100',  text: 'text-green-700' },
    { bg: 'bg-amber-100',  text: 'text-amber-700' },
    { bg: 'bg-rose-100',   text: 'text-rose-700' },
    { bg: 'bg-cyan-100',   text: 'text-cyan-700' },
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

function getInitials(name: string) {
  if (!name) return ''
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-screen">
    <!-- Top Bar -->
    <header class="h-14 md:h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 select-none">
      <!-- Mobile Top Bar Left (Logo and Console Subtitle) -->
      <div class="flex md:hidden flex-col leading-none">
        <span class="text-sm font-bold text-blue-600">BookManager</span>
        <span class="text-[11px] text-slate-400 font-medium mt-0.5">Admin Console</span>
      </div>

      <!-- Desktop Search Input -->
      <div class="hidden md:relative md:flex flex-1 max-w-lg">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search dashboard..."
          class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-150"
        />
      </div>

      <!-- Mobile Top Bar Right (32px avatar) -->
      <div class="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-200 md:hidden select-none">
        AD
      </div>

      <!-- Desktop Action buttons & User Profile -->
      <div class="hidden md:flex items-center gap-2 ml-4">
        <button 
          @click="handleRefresh"
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh Dashboard"
        >
          <RefreshCw class="w-4 h-4" />
        </button>
        <button 
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Filters"
        >
          <SlidersHorizontal class="w-4 h-4" />
        </button>
        
        <!-- Divider -->
        <div class="w-px h-5 bg-slate-200 mx-2" />

        <!-- Avatar circle -->
        <div class="w-9 h-9 rounded-full bg-blue-600 text-white font-semibold text-sm flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-200">
          AD
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <div class="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 bg-slate-50">
      <!-- Mobile Search Bar -->
      <div class="relative block md:hidden bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <Search class="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search dashboard..."
          class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-150 bg-white"
        />
      </div>

      <!-- Welcome Banner -->
      <div class="hidden md:flex items-center justify-between bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight leading-none">Welcome back, Administrator</h1>
          <p class="text-sm text-slate-500 mt-2 font-normal">Monitor catalog updates, manage writers and track circulation statuses.</p>
        </div>
        <div class="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0 hidden sm:block">
          <TrendingUp class="w-6 h-6" />
        </div>
      </div>

      <!-- Stat Cards Grid Loading State -->
      <div v-if="statsLoading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-20 bg-slate-100 animate-pulse rounded-xl" />
      </div>

      <!-- Stat Cards Grid Real Data -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Authors -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Authors</p>
            <p class="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{{ totalAuthors }}</p>
          </div>
          <div class="p-2.5 bg-blue-50 rounded-lg text-blue-600">
            <Users class="w-5 h-5" />
          </div>
        </div>

        <!-- Total Books -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Books</p>
            <p class="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{{ totalBooks }}</p>
          </div>
          <div class="p-2.5 bg-violet-50 rounded-lg text-violet-600">
            <BookOpen class="w-5 h-5" />
          </div>
        </div>

        <!-- Loaned Books -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Loaned Books</p>
            <p class="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{{ loanedBooksCount }}</p>
          </div>
          <div class="p-2.5 bg-amber-50 rounded-lg text-amber-600">
            <Clock class="w-5 h-5" />
          </div>
        </div>

        <!-- Reserved Books -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 font-medium uppercase tracking-wider">Reserved Books</p>
            <p class="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{{ reservedBooksCount }}</p>
          </div>
          <div class="p-2.5 bg-red-50 rounded-lg text-red-600">
            <AlertCircle class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- Side-by-Side Recent Cards -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <!-- LEFT CARD: Recent Books -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <!-- Card Header -->
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between select-none">
            <h2 class="text-sm font-semibold text-slate-900 leading-none">Recent Books</h2>
            <NuxtLink to="/books" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all &rarr;
            </NuxtLink>
          </div>

          <!-- Loading Skeleton (5 rows) -->
          <ul v-if="booksLoading" class="divide-y divide-slate-100 flex-1">
            <li v-for="i in 5" :key="i" class="px-5 py-3 flex items-center gap-4 animate-pulse">
              <div class="w-8 h-10 bg-slate-200 rounded shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-3 w-32 bg-slate-200 rounded" />
                <div class="h-2 w-20 bg-slate-100 rounded" />
              </div>
              <div class="h-3 w-8 bg-slate-200 rounded shrink-0" />
            </li>
          </ul>

          <!-- List Content -->
          <ul v-else class="divide-y divide-slate-100 flex-1">
            <li 
              v-for="(book, index) in filteredRecentBooks" 
              :key="book.id"
              class="px-4 md:px-5 py-3 items-center gap-3 md:gap-4 hover:bg-slate-50/50 transition-colors"
              :class="[index >= 3 ? 'hidden md:flex' : 'flex']"
            >
              <!-- Cover thumbnail (32x40px, rounded, object-cover, fallback bg-slate-200) -->
              <div class="w-8 h-10 rounded overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 select-none">
                <img v-if="book.cover_url" :src="book.cover_url" class="w-full h-full object-cover" alt="Cover" />
                <BookOpen v-else class="w-4 h-4 text-slate-400" />
              </div>
              
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-[13px] md:text-sm font-semibold text-slate-900 truncate leading-tight">{{ book.title }}</p>
                <p class="text-[11px] md:text-xs text-slate-500 mt-0.5 truncate font-normal">
                  {{ book.author?.name || 'Unknown' }}
                </p>
              </div>

              <!-- Year -->
              <span class="text-xs text-slate-400 shrink-0 font-medium">
                {{ book.published_year }}
              </span>
            </li>

            <!-- Empty State -->
            <li v-if="filteredRecentBooks.length === 0" class="px-5 py-8 text-center text-sm text-slate-400 font-normal">
              No recent books found matching search query.
            </li>
          </ul>
        </div>

        <!-- RIGHT CARD: Recent Authors -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <!-- Card Header -->
          <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between select-none">
            <h2 class="text-sm font-semibold text-slate-900 leading-none">Recent Authors</h2>
            <NuxtLink to="/authors" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all &rarr;
            </NuxtLink>
          </div>

          <!-- Loading Skeleton (5 rows) -->
          <ul v-if="authorsLoading" class="divide-y divide-slate-100 flex-1">
            <li v-for="i in 5" :key="i" class="px-5 py-3.5 flex items-center gap-4 animate-pulse">
              <div class="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
              <div class="flex-1 space-y-2">
                <div class="h-3 w-28 bg-slate-200 rounded" />
                <div class="h-2 w-16 bg-slate-100 rounded" />
              </div>
              <div class="h-4 w-4 bg-slate-200 rounded ml-auto shrink-0" />
            </li>
          </ul>

          <!-- List Content -->
          <ul v-else class="divide-y divide-slate-100 flex-1">
            <li 
              v-for="(author, index) in filteredRecentAuthors" 
              :key="author.id"
              class="flex items-center justify-between hover:bg-slate-50 cursor-pointer rounded-lg px-2 py-2 mx-3 my-1 transition-colors"
              :class="[index >= 3 ? 'hidden md:flex' : 'flex']"
              @click="openAuthorDetail(author.id)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <!-- Avatar circle with initials fallback -->
                <div v-if="author.profile_photo_url" class="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0 select-none">
                  <img :src="author.profile_photo_url" class="w-full h-full object-cover" alt="Avatar" />
                </div>
                <div 
                  v-else
                  class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 select-none"
                  :class="[getAvatarColor(author.name).bg, getAvatarColor(author.name).text]"
                >
                  {{ getInitials(author.name) }}
                </div>
                <!-- Info -->
                <div class="min-w-0">
                  <p class="text-[13px] md:text-sm font-semibold text-slate-900 truncate leading-tight">{{ author.name }}</p>
                  <p class="text-[11px] md:text-xs text-slate-500 mt-0.5 font-normal">
                    {{ author.total_books }} books
                  </p>
                </div>
              </div>

              <!-- Chevron -->
              <ChevronRight class="w-4 h-4 text-slate-300 mr-1 shrink-0" />
            </li>

            <!-- Empty State -->
            <li v-if="filteredRecentAuthors.length === 0" class="px-5 py-8 text-center text-sm text-slate-400 font-normal">
              No recent authors found matching search query.
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Author Detail Modal -->
    <AuthorDetailModal
      :show="showAuthorDetail"
      :author-id="selectedAuthorId"
      @close="showAuthorDetail = false"
    />
  </div>
</template>
