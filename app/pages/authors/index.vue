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
  X,
  MoreHorizontal
} from 'lucide-vue-next'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'
import AuthorFormModal from '~/components/authors/AuthorFormModal.vue'
import ConfirmDialog from '~/components/ui/ConfirmDialog.vue'
import SkeletonLoader from '~/components/ui/SkeletonLoader.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import { useToast } from '~/composables/useToast'

const toast = useToast()

// States
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref(10)

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
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

const activeMobileAuthorId = ref<number | null>(null)
const toggleMobileActions = (authorId: number) => {
  activeMobileAuthorId.value = activeMobileAuthorId.value === authorId ? null : authorId
}

// Validation errors returned from server or local checks
const addErrors = ref<Record<string, string>>({})
const editErrors = ref<Record<string, string>>({})

// Fetch authors with reactive query parameters
const { data: apiResponse, refresh: refreshAuthors, pending } = await useFetch(() => {
  const params = new URLSearchParams({
    page: String(currentPage.value),
    per_page: String(perPage.value),
    search: searchQuery.value
  })
  return `/api/v1/authors?${params.toString()}`
}, {
  watch: [currentPage, perPage]
})

// Debounce search
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    refreshAuthors()
  }, 300)
})

// Helper: generate avatar initials and colors
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

  // Simple hash for consistent colors
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

// Handlers
const handleAddClick = () => {
  // Clear forms & errors
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

// Submit forms to Nuxt API routes
const submitAdd = async (formData: FormData) => {
  submitting.value = true
  addErrors.value = {}

  try {
    const res = await $fetch<any>('/api/v1/authors', {
      method: 'POST',
      body: formData
    })
    
    toast.success('Author Created', `${res.data.name} has been added successfully.`)
    showAddModal.value = false
    refreshAuthors()
  } catch (err: any) {
    if (err.statusCode === 422 && err.data?.errors) {
      // Map validation errors
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

const submitEdit = async (formData: FormData) => {
  submitting.value = true
  editErrors.value = {}

  try {
    const res = await $fetch<any>(`/api/v1/authors/${editForm.value.id}`, {
      method: 'PUT',
      body: formData
    })
    
    toast.success('Changes Saved', `${res.data.name}'s profile has been updated.`)
    showEditModal.value = false
    refreshAuthors()
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

const confirmDelete = async () => {
  if (!authorToDelete.value) return
  submitting.value = true

  try {
    await $fetch(`/api/v1/authors/${authorToDelete.value.id}`, {
      method: 'DELETE'
    })
    toast.success('Author Deleted', `Successfully deleted author and all their associated books.`)
    showDeleteConfirm.value = false
    refreshAuthors()
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

// ────────────────────────────────────────────────────────
// AUTO-LOAD SPECIFICATION:
// Show VARIANT B (Edit Author Modal) as active/visible state by default for Gabriel García Márquez
onMounted(async () => {
  // Wait a short moment for data to load
  setTimeout(() => {
    const authors = apiResponse.value?.data || []
    const gabo = authors.find((a: any) => a.name.toLowerCase().includes('marquez'))
    if (gabo) {
      handleEditClick(gabo)
    }
  }, 400)
})
</script>

<template>
  <div class="flex-1 flex flex-col min-h-screen">
    <!-- Top Bar -->
    <header class="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shrink-0 select-none">
      <h1 class="text-[18px] md:text-[24px] font-bold text-slate-900 tracking-tight leading-none">Authors</h1>
      
      <div class="flex items-center gap-2 md:gap-3">
        <!-- Download icon (ghost) -->
        <button 
          @click="triggerDownload"
          class="hidden md:block p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Export CSV"
        >
          <Download class="w-5 h-5" />
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

        <!-- Add Author Button Desktop -->
        <BaseButton variant="primary" @click="handleAddClick" class="hidden md:inline-flex">
          <Plus class="w-4 h-4" />
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
    <div class="p-0 md:p-6 space-y-0 md:space-y-4 flex-1">
      
      <!-- Search Bar Card -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 mx-4 mt-4 md:mx-0 md:mt-0">
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
          @click="refreshAuthors"
          class="hidden md:block p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
          title="Refresh"
        >
          <RefreshCw class="w-4 h-4" />
        </button>

        <button 
          class="hidden md:inline-flex items-center gap-2 border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
        >
          <SlidersHorizontal class="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      <!-- Data Table Card (Desktop Only) -->
      <div class="hidden md:flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-col">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[768px] text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[80px]">
                  Avatar
                </th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">
                  Email
                </th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[140px]">
                  Birth Date
                </th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[90px]">
                  Books
                </th>
                <th class="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[100px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            
            <SkeletonLoader v-if="pending" />

            <tbody v-else class="divide-y divide-slate-100">
              <tr 
                v-for="author in apiResponse?.data" 
                :key="author.id"
                class="hover:bg-slate-50 transition-colors duration-150 group"
              >
                <!-- Avatar -->
                <td class="px-6 py-3.5 shrink-0">
                  <div 
                    class="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs border border-slate-200"
                    :class="getAvatarStyle(author.name).color"
                  >
                    {{ getAvatarStyle(author.name).initials }}
                  </div>
                </td>

                <!-- Name -->
                <td class="px-6 py-3.5">
                  <span class="text-sm font-semibold text-slate-900 block leading-tight">{{ author.name }}</span>
                </td>

                <!-- Email -->
                <td class="px-6 py-3.5 text-sm text-slate-500 truncate">
                  {{ author.email }}
                </td>

                <!-- Birth Date -->
                <td class="px-6 py-3.5 text-sm text-slate-600">
                  {{ formatDate(author.birth_date) }}
                </td>

                <!-- Books count (blue number, no badge) -->
                <td class="px-6 py-3.5">
                  <span class="text-sm font-semibold text-blue-600">
                    {{ author.total_books }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-3.5">
                  <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <!-- Edit button -->
                    <button 
                      @click="handleEditClick(author)"
                      class="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="Edit Profile"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <!-- Delete button -->
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

              <!-- Empty state -->
              <tr v-if="apiResponse?.data.length === 0">
                <td colspan="6">
                  <EmptyState 
                    :type="searchQuery ? 'authors-search' : 'authors-empty'" 
                    @action="handleAddClick" 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Row -->
        <div v-if="pending" class="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between select-none animate-pulse">
          <div class="h-4 w-40 bg-slate-200 rounded" />
          <div class="flex gap-1">
            <div v-for="i in 5" :key="i" class="h-8 w-8 bg-slate-200 rounded-lg" />
          </div>
        </div>
        <div v-else class="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between select-none">
          <p class="text-[12px] text-slate-500 font-normal">
            Showing {{ ((currentPage - 1) * perPage) + 1 }}–{{ Math.min(currentPage * perPage, apiResponse?.meta.total || 0) }} of {{ apiResponse?.meta.total || 0 }} results
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
            <template v-for="p in apiResponse?.meta.last_page" :key="p">
              <button
                v-if="p === 1 || p === apiResponse?.meta.last_page || Math.abs(p - currentPage) <= 1"
                @click="currentPage = p"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
                :class="[
                  currentPage === p 
                    ? 'bg-blue-600 text-white font-medium' 
                    : 'text-slate-600 hover:bg-slate-100'
                ]"
              >
                {{ p }}
              </button>
              <span 
                v-else-if="p === 2 || p === apiResponse?.meta.last_page - 1"
                class="px-1 text-slate-400 text-sm"
              >
                ...
              </span>
            </template>

            <!-- Next button -->
            <button 
              @click="currentPage < (apiResponse?.meta.last_page || 1) && (currentPage++)"
              :disabled="currentPage === (apiResponse?.meta.last_page || 1)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    <!-- Mobile Author List (Card Layout) -->
    <div v-if="pending" class="block md:hidden space-y-2 px-4 mt-3">
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

    <div v-else-if="apiResponse?.data.length === 0" class="block md:hidden px-4 py-6">
      <EmptyState 
        :type="searchQuery ? 'authors-search' : 'authors-empty'" 
        @action="handleAddClick" 
      />
    </div>

    <div v-else class="block md:hidden space-y-2 px-4 mt-3">
      <div 
        v-for="author in apiResponse?.data" 
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
              class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border border-slate-200 shrink-0 select-none"
              :class="getAvatarStyle(author.name).color"
            >
              {{ getAvatarStyle(author.name).initials }}
            </div>
            <!-- Name -->
            <span class="text-sm font-semibold text-slate-900 truncate leading-tight">{{ author.name }}</span>
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
      <div v-if="apiResponse?.meta && apiResponse.meta.last_page > 1" class="py-3 flex items-center justify-between select-none">
        <p class="text-[11px] text-slate-500 font-normal">
          Showing {{ ((currentPage - 1) * perPage) + 1 }}–{{ Math.min(currentPage * perPage, apiResponse?.meta.total || 0) }} of {{ apiResponse?.meta.total || 0 }}
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
          <span class="text-xs text-slate-600 font-medium px-2">{{ currentPage }} / {{ apiResponse?.meta.last_page }}</span>
          <!-- Next button -->
          <button 
            @click="currentPage < (apiResponse?.meta.last_page || 1) && (currentPage++)"
            :disabled="currentPage === (apiResponse?.meta.last_page || 1)"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>

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
      title="Delete Author?"
      :message="`Are you sure you want to delete ${authorToDelete?.name}? This action cannot be undone, and will automatically delete all books belonging to this author (Cascade Delete).`"
      confirmText="Delete"
      cancelText="Cancel"
      :loading="submitting"
      @confirm="confirmDelete"
      @close="showDeleteConfirm = false"
    />
  </div>
</template>
