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
import BookCover from '~/components/ui/BookCover.vue'
import { useToast } from '~/composables/useToast'

const toast = useToast()
const searchQuery = ref('')

// Fetch dashboard data from our backend REST API
const { data: booksData, refresh: refreshBooks } = await useFetch('/api/v1/books?per_page=100')
const { data: authorsData, refresh: refreshAuthors } = await useFetch('/api/v1/authors?per_page=100')

const handleRefresh = async () => {
  toast.success('Refreshing data...', 'Fetching latest statistics from database.')
  await Promise.all([refreshBooks(), refreshAuthors()])
}

// Compute statistics for the cards
const totalBooks = computed(() => booksData.value?.meta.total || 0)
const totalAuthors = computed(() => authorsData.value?.meta.total || 0)

const loanedBooksCount = computed(() => {
  if (!booksData.value?.data) return 0
  return booksData.value.data.filter((b: any) => b.status === 'LOANED').length
})

const reservedBooksCount = computed(() => {
  if (!booksData.value?.data) return 0
  return booksData.value.data.filter((b: any) => b.status === 'RESERVED').length
})

// Recent books (top 5 from backend)
const recentBooks = computed(() => {
  if (!booksData.value?.data) return []
  return booksData.value.data.slice(0, 5)
})

// Specific recent authors list matching the prompt requirements
const recentAuthorsList = [
  { name: 'Elena Richardson', booksCount: 12, initials: 'ER', color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Marcus Thorne', booksCount: 5, initials: 'MT', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Sarah Jenkins', booksCount: 8, initials: 'SJ', color: 'bg-amber-100 text-amber-800' },
  { name: 'Dr. Alan Turing', booksCount: 22, initials: 'AT', color: 'bg-rose-100 text-rose-800' },
  { name: 'Clara Voigt', booksCount: 3, initials: 'CV', color: 'bg-sky-100 text-sky-800' }
]

// Filter books and authors on search query
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
  if (!searchQuery.value) return recentAuthorsList
  const q = searchQuery.value.toLowerCase()
  return recentAuthorsList.filter(a => a.name.toLowerCase().includes(q))
})
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

      <!-- Desktop Search Input (Center / Left-aligned to fill width nicely) -->
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

      <!-- Stat Cards Grid -->
      <div class="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            <NuxtLink to="/books" class="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all &rarr;
            </NuxtLink>
          </div>

          <!-- List Content -->
          <ul class="divide-y divide-slate-100 flex-1">
            <li 
              v-for="(book, index) in filteredRecentBooks" 
              :key="book.id"
              class="px-4 md:px-5 py-3 items-center gap-3 md:gap-4 hover:bg-slate-50/50 transition-colors"
              :class="[index >= 3 ? 'hidden md:flex' : 'flex']"
            >
              <!-- Cover -->
              <BookCover :title="book.title" :cover-url="book.cover_url" size="xs" class="md:hidden" />
              <BookCover :title="book.title" :cover-url="book.cover_url" size="sm" class="hidden md:block" />
              
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-[13px] md:text-sm font-semibold text-slate-900 truncate leading-tight">{{ book.title }}</p>
                <p class="text-[11px] md:text-xs text-slate-500 mt-0.5 truncate font-normal">
                  {{ book.author?.name || 'Unknown' }}
                </p>
              </div>

              <!-- Status Badge -->
              <span 
                class="px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase shrink-0"
                :class="{
                  'bg-green-50 text-green-700 border-green-200': book.status === 'AVAILABLE',
                  'bg-amber-50 text-amber-700 border-amber-200': book.status === 'LOANED',
                  'bg-red-50 text-red-700 border-red-200': book.status === 'RESERVED'
                }"
              >
                {{ book.status }}
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
            <NuxtLink to="/authors" class="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all &rarr;
            </NuxtLink>
          </div>

          <!-- List Content -->
          <ul class="divide-y divide-slate-100 flex-1">
            <li 
              v-for="(author, index) in filteredRecentAuthors" 
              :key="author.name"
              class="px-4 md:px-5 py-3 items-center justify-between hover:bg-slate-50/50 transition-colors"
              :class="[index >= 3 ? 'hidden md:flex' : 'flex']"
            >
              <div class="flex items-center gap-3 min-w-0">
                <!-- Avatar circle -->
                <div 
                  class="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm shrink-0 select-none"
                  :class="author.color"
                >
                  {{ author.initials }}
                </div>
                <!-- Info -->
                <div class="min-w-0">
                  <p class="text-[13px] md:text-sm font-semibold text-slate-900 truncate leading-tight">{{ author.name }}</p>
                  <p class="text-[11px] md:text-xs text-slate-500 mt-0.5 font-normal">
                    {{ author.booksCount }} Books
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
  </div>
</template>
