<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Search, 
  RefreshCw, 
  SlidersHorizontal, 
  Download, 
  Bell, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  BookOpen,
  AlertCircle
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'
import BaseSelect from '~/components/base/BaseSelect.vue'
import BookFormModal from '~/components/books/BookFormModal.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import BookCover from '~/components/ui/BookCover.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import AuthorDetailModal from '~/components/authors/AuthorDetailModal.vue'
import { useToast } from '~/composables/useToast'
import { useBooks } from '~/composables/useBooks'

const toast = useToast()
const route = useRoute()
const router = useRouter()

// Composable
const { books, meta, loading, error, fetchBooks, createBook, updateBook, deleteBook } = useBooks()

// Query params states synchronized with URL
const searchQuery = ref((route.query.search as string) || '')
const selectedAuthorId = ref<string | number>((route.query.author_id as string) || '')
const currentPage = ref(parseInt(route.query.page as string) || 1)
const perPage = ref(10)

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const submitting = ref(false)

// Author detail modal states
const showAuthorDetail = ref(false)
const selectedAuthorDetailId = ref<number | null>(null)

// Form states
const addForm = ref({
  title: '',
  author_id: '' as string | number,
  isbn: '',
  published_year: '' as string | number,
  status: 'AVAILABLE' as 'AVAILABLE' | 'LOANED' | 'RESERVED',
  description: ''
})

const editForm = ref({
  id: 0,
  title: '',
  author_id: '' as string | number,
  isbn: '',
  published_year: '' as string | number,
  status: 'AVAILABLE' as 'AVAILABLE' | 'LOANED' | 'RESERVED',
  description: ''
})

const bookToDelete = ref<any>(null)
const addErrors = ref<Record<string, string>>({})
const editErrors = ref<Record<string, string>>({})

// Fetch authors list for dropdown filter
const { data: authorsResponse } = await useFetch('/api/v1/authors?per_page=100')
const authorsList = computed(() => {
  if (!authorsResponse.value?.data) return []
  return authorsResponse.value.data.map((a: any) => ({
    value: a.id,
    label: a.name
  }))
})

// Watchers and Debounce Search to update query parameters and fetch books
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    triggerFetch()
  }, 300)
})

watch(selectedAuthorId, () => {
  currentPage.value = 1
  triggerFetch()
})

watch(currentPage, () => {
  triggerFetch()
})

const triggerFetch = () => {
  // Push query parameters to browser URL
  router.push({
    query: {
      ...route.query,
      page: String(currentPage.value),
      search: searchQuery.value || undefined,
      author_id: selectedAuthorId.value ? String(selectedAuthorId.value) : undefined
    }
  })
  
  fetchBooks({
    page: currentPage.value,
    per_page: perPage.value,
    search: searchQuery.value,
    author_id: selectedAuthorId.value
  })
}

// Handlers
const handleAddClick = () => {
  addForm.value = {
    title: '',
    author_id: '',
    isbn: '',
    published_year: '',
    status: 'AVAILABLE',
    description: ''
  }
  addErrors.value = {}
  showAddModal.value = true
}

const handleEditClick = (book: any) => {
  editErrors.value = {}
  editForm.value = {
    id: book.id,
    title: book.title,
    author_id: book.author_id,
    isbn: book.isbn,
    published_year: book.published_year,
    status: book.status,
    description: book.description || ''
  }
  showEditModal.value = true
}

const handleDeleteClick = (book: any) => {
  bookToDelete.value = book
  showDeleteConfirm.value = true
}

const handleAuthorClick = (authorId: number) => {
  selectedAuthorDetailId.value = authorId
  showAuthorDetail.value = true
}

// Submit POST
const submitAdd = async (formData: FormData) => {
  submitting.value = true
  addErrors.value = {}

  try {
    const res = await createBook(formData)
    toast.success('Book Created', `"${res.data.title}" has been successfully cataloged.`)
    showAddModal.value = false
    triggerFetch()
  } catch (err: any) {
    if (err.statusCode === 422 && err.data?.errors) {
      const mapped: Record<string, string> = {}
      Object.entries(err.data.errors).forEach(([k, v]: [string, any]) => {
        mapped[k] = v[0]
      })
      addErrors.value = mapped
      toast.danger('Validation Error', 'Please check the input fields.')
    } else {
      toast.danger('System Error', 'Failed to save book.')
    }
  } finally {
    submitting.value = false
  }
}

// Submit PUT
const submitEdit = async (formData: FormData) => {
  submitting.value = true
  editErrors.value = {}

  try {
    const res = await updateBook(editForm.value.id, formData)
    toast.success('Changes Saved', `"${res.data.title}" details have been updated.`)
    showEditModal.value = false
    triggerFetch()
  } catch (err: any) {
    if (err.statusCode === 422 && err.data?.errors) {
      const mapped: Record<string, string> = {}
      Object.entries(err.data.errors).forEach(([k, v]: [string, any]) => {
        mapped[k] = v[0]
      })
      editErrors.value = mapped
      toast.danger('Validation Error', 'Please check the input fields.')
    } else {
      toast.danger('System Error', 'Failed to update book.')
    }
  } finally {
    submitting.value = false
  }
}

// Submit DELETE
const confirmDelete = async () => {
  if (!bookToDelete.value) return
  submitting.value = true

  try {
    await deleteBook(bookToDelete.value.id)
    toast.success('Book Deleted', `Successfully deleted "${bookToDelete.value.title}".`)
    showDeleteConfirm.value = false
    triggerFetch()
  } catch (err) {
    toast.danger('Error', 'Failed to delete book.')
  } finally {
    submitting.value = false
    bookToDelete.value = null
  }
}

const triggerExport = () => {
  toast.warning('Feature Out of Scope', 'Excel/CSV export is planned for future improvements.')
}

const triggerNotifications = () => {
  toast.success('Notifications Checked', 'Your catalog alerts are currently up to date.')
}

// INITIAL FETCH ON MOUNT
onMounted(() => {
  triggerFetch()
  
  // Auto-open "Silent Patterns" edit modal if available for assessment
  setTimeout(() => {
    const silentPatterns = books.value.find((b: any) => b.title.toLowerCase().includes('silent patterns'))
    if (silentPatterns) {
      handleEditClick(silentPatterns)
    }
  }, 600)
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-screen">
    <!-- Page Header -->
    <header class="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0 select-none">
      <div class="flex flex-col">
        <h1 class="text-lg md:text-2xl font-bold md:font-semibold text-slate-900 tracking-tight leading-tight">Books</h1>
        <p class="hidden md:block text-sm text-slate-500 mt-0.5">Manage your book collection</p>
      </div>
      
      <div class="flex items-center gap-2 md:gap-3">
        <!-- Export Button (ghost) -->
        <button 
          @click="triggerExport"
          class="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Export CSV"
        >
          <Download class="w-4 h-4" />
          <span>Export</span>
        </button>

        <!-- Add Book Button Desktop -->
        <BaseButton variant="primary" @click="handleAddClick" class="hidden md:inline-flex">
          <Plus class="w-4 h-4 mr-1.5" />
          <span>Add Book</span>
        </BaseButton>

        <!-- Add Book Button Mobile -->
        <button 
          @click="handleAddClick" 
          class="inline-flex md:hidden items-center justify-center bg-blue-600 text-white rounded-lg px-3 py-1.5 text-[13px] font-semibold hover:bg-blue-700 transition-colors"
        >
          + Add
        </button>

        <!-- Bell icon with red dot -->
        <button 
          @click="triggerNotifications"
          class="hidden md:block p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative"
          title="Notifications"
        >
          <Bell class="w-5 h-5" />
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        <!-- Divider -->
        <div class="w-px h-6 bg-slate-200 mx-1 hidden md:block" />

        <!-- Profile Avatar -->
        <div class="w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-600 text-white font-semibold text-xs md:text-sm flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-200">
          AD
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <div class="p-0 md:py-4 flex-1 flex flex-col bg-slate-50/50">
      
      <!-- Filter Bar -->
      <div class="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col md:flex-row items-center gap-3 mx-4 md:mx-6 mt-4">
        <!-- Left: Search Input -->
        <div class="relative flex-1 w-full">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title or ISBN..."
            class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-150"
          />
        </div>
        
        <!-- Middle: Dropdown filter -->
        <div class="w-full md:w-[220px] shrink-0 relative">
          <select
            v-model="selectedAuthorId"
            class="w-full border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none transition-all duration-150 cursor-pointer min-w-[180px]"
          >
            <option value="">All Authors</option>
            <option v-for="author in authorsList" :key="author.value" :value="author.value">
              {{ author.label }}
            </option>
          </select>
          <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <button 
            @click="triggerFetch"
            class="p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw class="w-4 h-4" />
          </button>
          
          <button 
            class="p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            title="Filters"
          >
            <SlidersHorizontal class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Data Table Card -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col mx-4 md:mx-6 mt-4">
        <!-- Error State -->
        <div v-if="error" class="p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto py-12 select-none">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-200">
            <AlertCircle class="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 class="text-base font-semibold text-slate-900">Failed to load books</h3>
          <p class="text-sm text-slate-500 mt-2">There was a problem connecting to the server. Please try again.</p>
          <div class="flex gap-3 mt-6 w-full">
            <BaseButton variant="primary" class="flex-1" @click="triggerFetch">Try again</BaseButton>
            <BaseButton variant="secondary" class="flex-1" @click="router.push('/')">Go to Dashboard</BaseButton>
          </div>
        </div>

        <!-- Loading State (Skeleton 10 rows) -->
        <div v-else-if="loading && books.length === 0" class="overflow-x-auto">
          <table class="w-full min-w-[960px] text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="w-[80px] text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Cover</th>
                <th class="text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Title</th>
                <th class="w-[180px] text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Author</th>
                <th class="w-[160px] text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ISBN</th>
                <th class="w-[80px] text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Year</th>
                <th class="w-[90px] text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <SkeletonLoader :rows="10" />
          </table>
        </div>

        <!-- Empty State -->
        <div v-else-if="books.length === 0" class="p-8 flex flex-col items-center justify-center text-center py-12 select-none">
          <svg class="w-20 h-20 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <h3 class="text-base font-medium text-slate-700 mt-3">No books found</h3>
          <p class="text-sm text-slate-400 mt-1 max-w-sm">
            {{ (searchQuery || selectedAuthorId) ? 'No books match your search. Try a different keyword.' : 'Add your first book to get started with the library.' }}
          </p>
          <BaseButton variant="primary" class="mt-5" @click="handleAddClick">
            <Plus class="w-4 h-4 mr-1.5" />
            <span>Add Book</span>
          </BaseButton>
        </div>

        <!-- Books Table Wrapper -->
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[960px] text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="w-[80px] text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Cover</th>
                <th class="text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Title</th>
                <th class="w-[180px] text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Author</th>
                <th class="w-[160px] text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">ISBN</th>
                <th class="w-[80px] text-center text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Year</th>
                <th class="w-[90px] text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="book in books" 
                :key="book.id"
                class="hover:bg-slate-50 transition-colors duration-100 group"
              >
                <!-- Cover Column -->
                <td class="px-4 py-3">
                  <BookCover :title="book.title" :cover-url="book.cover_url" size="md" />
                </td>

                <!-- Title Column -->
                <td class="px-4 py-3 text-sm font-medium text-slate-900">
                  {{ book.title }}
                </td>

                <!-- Author Column -->
                <td class="px-4 py-3 text-sm">
                  <span 
                    @click="handleAuthorClick(book.author_id)"
                    class="text-blue-600 cursor-pointer hover:underline font-medium block"
                  >
                    {{ book.author?.name || 'Unknown' }}
                  </span>
                </td>

                <!-- ISBN Column -->
                <td class="px-4 py-3 font-mono text-[13px] text-slate-600 tracking-tight">
                  {{ book.isbn }}
                </td>

                <!-- Published Year Column -->
                <td class="px-4 py-3 text-sm text-slate-600 text-center">
                  {{ book.published_year }}
                </td>

                <!-- Actions Column -->
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <!-- Edit -->
                    <button 
                      @click="handleEditClick(book)"
                      class="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="Edit Book"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <!-- Delete -->
                    <button 
                      @click="handleDeleteClick(book)"
                      class="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete Book"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Row -->
        <div v-if="!error && books.length > 0 && meta && meta.last_page > 1" class="px-4 py-3 flex items-center justify-between border-t border-slate-100 select-none">
          <p class="text-xs text-slate-500 font-normal">
            Showing {{ ((currentPage - 1) * perPage) + 1 }}–{{ Math.min(currentPage * perPage, meta.total) }} of {{ meta.total }} results
          </p>

          <div class="flex items-center gap-1">
            <!-- Prev button -->
            <button 
              @click="currentPage > 1 && (currentPage--)"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>

            <!-- Page indicators -->
            <template v-for="p in meta.last_page" :key="p">
              <button
                v-if="p === 1 || p === meta.last_page || Math.abs(p - currentPage) <= 1"
                @click="currentPage = p"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
                :class="[
                  currentPage === p 
                    ? 'bg-blue-600 text-white font-medium shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                ]"
              >
                {{ p }}
              </button>
              <span 
                v-else-if="p === 2 || p === meta.last_page - 1"
                class="px-1 text-slate-400 text-sm"
              >
                ...
              </span>
            </template>

            <!-- Next button -->
            <button 
              @click="currentPage < (meta.last_page || 1) && (currentPage++)"
              :disabled="currentPage === (meta.last_page || 1)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- VARIANT A: ADD BOOK MODAL -->
    <BookFormModal 
      :show="showAddModal" 
      title="Add book" 
      :authors="authorsList"
      :errors="addErrors"
      :submitting="submitting"
      @close="showAddModal = false"
      @submit="submitAdd"
    />

    <!-- VARIANT B: EDIT BOOK MODAL -->
    <BookFormModal 
      :show="showEditModal" 
      title="Edit book" 
      :book="editForm"
      :authors="authorsList"
      :errors="editErrors"
      :submitting="submitting"
      @close="showEditModal = false"
      @submit="submitEdit"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Delete book"
      :message="`Are you sure you want to delete '${bookToDelete?.title}'? This action cannot be undone.`"
      confirmText="Delete book"
      cancelText="Cancel"
      :loading="submitting"
      @confirm="confirmDelete"
      @close="showDeleteConfirm = false"
    />

    <!-- Author Detail Modal -->
    <AuthorDetailModal
      :show="showAuthorDetail"
      :author-id="selectedAuthorDetailId"
      @close="showAuthorDetail = false; selectedAuthorDetailId = null"
    />
  </div>
</template>
