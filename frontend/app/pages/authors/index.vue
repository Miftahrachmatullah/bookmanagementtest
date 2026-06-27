<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Search, 
  RefreshCw, 
  SlidersHorizontal, 
  Download, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  X,
  MoreHorizontal,
  Eye,
  AlertCircle
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'
import AuthorFormModal from '~/components/authors/AuthorFormModal.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import SkeletonLoader from '~/components/ui/SkeletonLoader.vue'
import AuthorDetailModal from '~/components/authors/AuthorDetailModal.vue'
import { useToast } from '~/composables/useToast'
import { useAuthors } from '~/composables/useAuthors'

const toast = useToast()
const route = useRoute()
const router = useRouter()

// Composable
const { authors, meta, loading, error, fetchAuthors, createAuthor, updateAuthor, deleteAuthor } = useAuthors()

// States synced with URL
const searchQuery = ref((route.query.search as string) || '')
const currentPage = ref(parseInt(route.query.page as string) || 1)
const perPage = ref(10)

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const showAuthorDetail = ref(false)
const selectedAuthorDetailId = ref<number | null>(null)
const submitting = ref(false)

// Form states
const addForm = ref({
  name: '',
  email: '',
  birth_date: '',
  bio: ''
})

const editForm = ref({
  id: 0,
  name: '',
  email: '',
  birth_date: '',
  bio: ''
})

const authorToDelete = ref<any>(null)
const addErrors = ref<Record<string, string>>({})
const editErrors = ref<Record<string, string>>({})

const activeMobileAuthorId = ref<number | null>(null)
const toggleMobileActions = (authorId: number) => {
  activeMobileAuthorId.value = activeMobileAuthorId.value === authorId ? null : authorId
}

// Avatar Fallback — Implementasi
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

// Reactive params synchronization
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    triggerFetch()
  }, 300)
})

watch(currentPage, () => {
  triggerFetch()
})

const triggerFetch = () => {
  router.push({
    query: {
      ...route.query,
      page: String(currentPage.value),
      search: searchQuery.value || undefined
    }
  })

  fetchAuthors({
    page: currentPage.value,
    per_page: perPage.value,
    search: searchQuery.value
  })
}

// Handlers
const handleAddClick = () => {
  addForm.value = { name: '', email: '', birth_date: '', bio: '' }
  addErrors.value = {}
  showAddModal.value = true
}

const handleEditClick = (author: any) => {
  editErrors.value = {}
  editForm.value = {
    id: author.id,
    name: author.name,
    email: author.email,
    birth_date: author.birth_date,
    bio: author.bio || ''
  }
  showEditModal.value = true
}

const handleDeleteClick = (author: any) => {
  authorToDelete.value = author
  showDeleteConfirm.value = true
}

const handleAuthorClick = (authorId: number) => {
  selectedAuthorDetailId.value = authorId
  showAuthorDetail.value = true
}

// Submit Create
const submitAdd = async (formData: FormData) => {
  submitting.value = true
  addErrors.value = {}

  try {
    const res = await createAuthor(formData)
    toast.success('Author Created', `${res.data.name} has been added successfully.`)
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
      toast.danger('System Error', 'Failed to save author.')
    }
  } finally {
    submitting.value = false
  }
}

// Submit Edit
const submitEdit = async (formData: FormData) => {
  submitting.value = true
  editErrors.value = {}

  try {
    const res = await updateAuthor(editForm.value.id, formData)
    toast.success('Changes Saved', `${res.data.name}'s profile has been updated.`)
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
      toast.danger('System Error', 'Failed to update author.')
    }
  } finally {
    submitting.value = false
  }
}

// Submit Delete
const confirmDelete = async () => {
  if (!authorToDelete.value) return
  submitting.value = true

  try {
    await deleteAuthor(authorToDelete.value.id)
    toast.success('Author Deleted', `Successfully deleted author and all their associated books.`)
    showDeleteConfirm.value = false
    triggerFetch()
  } catch (err) {
    toast.danger('Error', 'Failed to delete author.')
  } finally {
    submitting.value = false
    authorToDelete.value = null
  }
}

const triggerDownload = () => {
  toast.warning('Feature Out of Scope', 'CSV/Excel export is planned for future improvements.')
}

const triggerNotifications = () => {
  toast.success('Notifications Checked', 'Your catalog alerts are currently up to date.')
}

// INITIAL FETCH & AUTO-OPEN SPEC
onMounted(() => {
  triggerFetch()

  // Auto-open "Gabriel García Márquez" edit modal if available
  setTimeout(() => {
    const gabo = authors.value.find((a: any) => a.name.toLowerCase().includes('marquez'))
    if (gabo) {
      handleEditClick(gabo)
    }
  }, 600)
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-screen">
    <!-- Top Bar / Page Header -->
    <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 select-none">
      <div class="flex flex-col">
        <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Authors</h1>
        <p class="text-sm text-slate-500 mt-0.5">Manage your book authors</p>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Download icon (ghost) -->
        <button 
          @click="triggerDownload"
          class="hidden md:block p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Export CSV"
        >
          <Download class="w-5 h-5" />
        </button>



        <!-- Add Author Button Desktop -->
        <BaseButton variant="primary" @click="handleAddClick" class="hidden md:inline-flex">
          <Plus class="w-4 h-4 mr-1.5" />
          <span>Add Author</span>
        </BaseButton>

        <!-- Add Author Button Mobile -->
        <button 
          @click="handleAddClick" 
          class="inline-flex md:hidden items-center justify-center bg-blue-600 text-white rounded-lg px-3 py-1.5 text-[13px] font-semibold hover:bg-blue-700 transition-colors"
        >
          + Add
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
      
      <!-- Search Bar -->
      <div class="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 mx-6 mt-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            class="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-150"
          />
        </div>
        
        <button 
          @click="triggerFetch"
          class="p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
          title="Refresh"
        >
          <RefreshCw class="w-4 h-4" />
        </button>
      </div>

      <!-- Data Table Card -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col mx-6 mt-4">
        <!-- Error State -->
        <div v-if="error" class="p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto py-12 select-none">
          <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-200">
            <AlertCircle class="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 class="text-base font-semibold text-slate-900">Failed to load authors</h3>
          <p class="text-sm text-slate-500 mt-2">There was a problem connecting to the server. Please try again.</p>
          <div class="flex gap-3 mt-6 w-full">
            <BaseButton variant="primary" class="flex-1" @click="triggerFetch">Try again</BaseButton>
            <BaseButton variant="secondary" class="flex-1" @click="router.push('/')">Go to Dashboard</BaseButton>
          </div>
        </div>

        <!-- Loading State (Skeleton 10 rows) -->
        <div v-else-if="loading && authors.length === 0" class="overflow-x-auto hidden md:block">
          <table class="w-full min-w-[768px] text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[64px]">AVATAR</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">NAME</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[220px]">EMAIL</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[140px]">BIRTH DATE</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[80px] text-center">BOOKS</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[110px] text-right">ACTIONS</th>
              </tr>
            </thead>
            <SkeletonLoader :rows="10" />
          </table>
        </div>

        <!-- Empty State -->
        <div v-else-if="authors.length === 0" class="p-8 flex flex-col items-center justify-center text-center py-12 select-none hidden md:flex">
          <svg class="w-20 h-20 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <h3 class="text-base font-medium text-slate-700 mt-3">No authors found</h3>
          <p class="text-sm text-slate-400 mt-1 max-w-sm">
            {{ searchQuery ? 'No authors match your search. Try a different keyword.' : 'Add your first author to get started.' }}
          </p>
          <BaseButton variant="primary" class="mt-5" @click="handleAddClick">
            <Plus class="w-4 h-4 mr-1.5" />
            <span>Add Author</span>
          </BaseButton>
        </div>

        <!-- Desktop Table -->
        <div v-else class="overflow-x-auto hidden md:block">
          <table class="w-full min-w-[768px] text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[64px]">AVATAR</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">NAME</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[220px]">EMAIL</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[140px]">BIRTH DATE</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[80px] text-center">BOOKS</th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[110px] text-right">ACTIONS</th>
              </tr>
            </thead>
            
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="author in authors" 
                :key="author.id"
                class="hover:bg-slate-50 transition-colors duration-150 group"
              >
                <!-- Avatar -->
                <td class="px-6 py-3.5 w-[64px]">
                  <div v-if="author.profile_photo_url" class="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 select-none">
                    <img :src="author.profile_photo_url" class="w-full h-full object-cover" alt="Avatar" />
                  </div>
                  <div 
                    v-else
                    class="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs border shrink-0 select-none"
                    :class="[getAvatarColor(author.name).bg, getAvatarColor(author.name).text]"
                  >
                    {{ getInitials(author.name) }}
                  </div>
                </td>

                <!-- Name -->
                <td class="px-6 py-3.5">
                  <span 
                    @click="handleAuthorClick(author.id)"
                    class="text-sm font-medium text-slate-900 cursor-pointer hover:text-blue-600 block leading-tight"
                  >
                    {{ author.name }}
                  </span>
                </td>

                <!-- Email -->
                <td class="px-6 py-3.5 text-sm text-slate-500 truncate w-[220px]">
                  {{ author.email }}
                </td>

                <!-- Birth Date -->
                <td class="px-6 py-3.5 text-sm text-slate-600 w-[140px]">
                  {{ formatDate(author.birth_date) }}
                </td>

                <!-- Books count (badge bulat biru) -->
                <td class="px-6 py-3.5 w-[80px] text-center">
                  <span class="inline-flex bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {{ author.total_books }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-3.5 w-[110px]">
                  <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <!-- View Eye -->
                    <button 
                      @click="handleAuthorClick(author.id)"
                      class="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="View Profile"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                    <!-- Edit -->
                    <button 
                      @click="handleEditClick(author)"
                      class="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="Edit Profile"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <!-- Delete -->
                    <button 
                      @click="handleDeleteClick(author)"
                      class="p-1.5 rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete Author"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Desktop Pagination Row -->
        <div v-if="!error && authors.length > 0 && meta && meta.last_page > 1" class="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between select-none hidden md:flex">
          <p class="text-[12px] text-slate-500 font-normal">
            Showing {{ ((currentPage - 1) * perPage) + 1 }}–{{ Math.min(currentPage * perPage, meta.total || 0) }} of {{ meta.total || 0 }} results
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

      <!-- Mobile Author List (Card Layout) -->
      <div v-if="loading && authors.length === 0" class="block md:hidden space-y-2 px-4 mt-3">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col space-y-3 animate-pulse">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-slate-200 rounded-full" />
              <div class="h-4 w-32 bg-slate-200 rounded" />
            </div>
            <div class="h-6 w-16 bg-slate-200 rounded-full" />
          </div>
          <div class="h-4 w-48 bg-slate-200 rounded" />
        </div>
      </div>

      <div v-else-if="authors.length === 0" class="block md:hidden px-4 py-6">
        <div class="p-8 flex flex-col items-center justify-center text-center py-12 select-none">
          <svg class="w-20 h-20 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <h3 class="text-base font-medium text-slate-700 mt-3">No authors found</h3>
          <p class="text-sm text-slate-400 mt-1 max-w-sm">
            {{ searchQuery ? 'No authors match your search. Try a different keyword.' : 'Add your first author to get started.' }}
          </p>
          <BaseButton variant="primary" class="mt-5" @click="handleAddClick">
            <Plus class="w-4 h-4 mr-1.5" />
            <span>Add Author</span>
          </BaseButton>
        </div>
      </div>

      <div v-else class="block md:hidden space-y-2 px-4 mt-3">
        <div 
          v-for="author in authors" 
          :key="author.id"
          class="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-col relative"
        >
          <!-- Top Row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <!-- Avatar (40px) -->
              <div v-if="author.profile_photo_url" class="w-10 h-10 rounded-full overflow-hidden shrink-0 select-none border border-slate-200">
                <img :src="author.profile_photo_url" class="w-full h-full object-cover" alt="Avatar" />
              </div>
              <div 
                v-else
                class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border shrink-0 select-none"
                :class="[getAvatarColor(author.name).bg, getAvatarColor(author.name).text]"
              >
                {{ getInitials(author.name) }}
              </div>
              <!-- Name -->
              <span 
                @click="handleAuthorClick(author.id)"
                class="text-sm font-semibold text-slate-900 truncate leading-tight cursor-pointer hover:text-blue-600"
              >
                {{ author.name }}
              </span>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <!-- Books Badge (Blue) -->
              <span class="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                {{ author.total_books }} Books
              </span>
              
              <!-- Action Dots (⋯) -->
              <div class="relative">
                <button 
                  @click="toggleMobileActions(author.id)"
                  class="p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  <MoreHorizontal class="w-5 h-5" />
                </button>
                
                <!-- Mobile Actions Dropdown -->
                <div 
                  v-if="activeMobileAuthorId === author.id" 
                  class="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 text-left"
                >
                  <button 
                    @click="handleAuthorClick(author.id); activeMobileAuthorId = null"
                    class="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button 
                    @click="handleEditClick(author); activeMobileAuthorId = null"
                    class="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button 
                    @click="handleDeleteClick(author); activeMobileAuthorId = null"
                    class="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Row -->
          <div class="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center text-[12px] text-slate-500 font-normal">
            <span>{{ author.email }}</span>
            <span class="mx-1.5 text-slate-300">&bull;</span>
            <span>{{ formatDate(author.birth_date) }}</span>
          </div>
        </div>

        <!-- Mobile Pagination -->
        <div v-if="meta && meta.last_page > 1" class="py-3 flex items-center justify-between select-none">
          <p class="text-[11px] text-slate-500 font-normal">
            Showing {{ ((currentPage - 1) * perPage) + 1 }}–{{ Math.min(currentPage * perPage, meta.total || 0) }} of {{ meta.total || 0 }}
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
            <span class="text-xs text-slate-600 font-medium px-2">{{ currentPage }} / {{ meta.last_page }}</span>
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

    <!-- MODALS & DIALOGS -->

    <!-- VARIANT A: ADD AUTHOR MODAL -->
    <AuthorFormModal 
      :show="showAddModal" 
      title="Add author" 
      :errors="addErrors"
      :submitting="submitting"
      @close="showAddModal = false"
      @submit="submitAdd"
    />

    <!-- VARIANT B: EDIT AUTHOR MODAL -->
    <AuthorFormModal 
      :show="showEditModal" 
      title="Edit author" 
      :author="editForm"
      :errors="editErrors"
      :submitting="submitting"
      @close="showEditModal = false"
      @submit="submitEdit"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Delete author"
      :heading="`Are you sure you want to delete '${authorToDelete?.name}'?`"
      :message="`This action cannot be undone. All ${authorToDelete?.total_books || 0} books associated with this author will also be permanently deleted.`"
      confirmText="Delete author"
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
