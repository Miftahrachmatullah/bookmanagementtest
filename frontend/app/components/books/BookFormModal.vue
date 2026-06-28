<script setup lang="ts">
import { ref, watch } from 'vue'
import { ImagePlus, Camera, X, AlertCircle, ChevronDown } from 'lucide-vue-next'
import BaseModal from '../base/BaseModal.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseSelect from '../base/BaseSelect.vue'
import BaseButton from '../base/BaseButton.vue'

interface Props {
  show: boolean
  title: string
  book?: any // existing book details if in edit mode
  authors: { value: string | number; label: string }[]
  errors?: Record<string, string>
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
  submitting: false
})

const emit = defineEmits(['close', 'submit'])

// ─── Runtime Config ───────────────────────────────────────
const config = useRuntimeConfig()
const BASE = config.public.apiBase

// ─── State: Daftar Author untuk Dropdown ──────────────────
const authorOptions = ref<any[]>([])
const loadingAuthors = ref(false)
const authorFetchError = ref<string | null>(null)

// ─── Fetch semua author dari API (tanpa pagination) ───────
async function fetchAuthorOptions() {
  loadingAuthors.value = true
  authorFetchError.value = null
  try {
    const data = await $fetch<{ data: any[] }>(`${BASE}/authors`, {
      params: { per_page: 100, page: 1 },
      headers: { Accept: 'application/json' },
    })
    authorOptions.value = data.data
  } catch (err: any) {
    const msg = err?.data?.message ?? err?.message ?? 'Gagal memuat data author.'
    authorFetchError.value = msg
    console.error('[BookFormModal] Gagal fetch author options:', msg)
  } finally {
    loadingAuthors.value = false
  }
}

// Form fields state
const form = ref({
  title: '',
  author_id: '' as string | number,
  isbn: '',
  published_year: '' as string | number,
  status: 'AVAILABLE' as 'AVAILABLE' | 'LOANED' | 'RESERVED',
  description: ''
})

// Cover upload states
const bookCover = ref<File | null>(null)
const bookCoverPreview = ref<string | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)
const coverError = ref<string | null>(null)
const coverRemoved = ref(false)

function triggerCoverUpload() {
  coverInput.value?.click()
}

function handleCoverUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    coverError.value = 'Only JPG and PNG files are allowed.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    coverError.value = 'File size must be less than 5MB.'
    return
  }

  coverError.value = null
  bookCover.value = file
  bookCoverPreview.value = URL.createObjectURL(file)
  coverRemoved.value = false
}

function removeCover() {
  bookCover.value = null
  bookCoverPreview.value = null
  coverError.value = null
  coverRemoved.value = true
  if (coverInput.value) coverInput.value.value = ''
}

// Reset form and cover states when modal show toggles
watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchAuthorOptions()
    
    bookCover.value = null
    coverError.value = null
    coverRemoved.value = false
    
    if (props.book) {
      // Prefill fields for Edit mode
      form.value = {
        title: props.book.title || '',
        author_id: props.book.author_id || '',
        isbn: props.book.isbn || '',
        published_year: props.book.published_year || '',
        status: props.book.status || 'AVAILABLE',
        description: props.book.description || ''
      }
      bookCoverPreview.value = props.book.cover_url || null
    } else {
      // Clear fields for Add mode
      form.value = {
        title: '',
        author_id: '',
        isbn: '',
        published_year: '',
        status: 'AVAILABLE',
        description: ''
      }
      bookCoverPreview.value = null
    }
  }
})

function submitForm() {
  const formData = new FormData()
  formData.append('title', form.value.title)
  formData.append('author_id', String(form.value.author_id))
  formData.append('isbn', form.value.isbn)
  formData.append('published_year', String(form.value.published_year))
  formData.append('status', form.value.status)
  if (form.value.description) {
    formData.append('description', form.value.description)
  }
  
  if (bookCover.value) {
    formData.append('cover_image', bookCover.value)
  } else if (coverRemoved.value) {
    formData.append('cover_image_remove', '1')
  }

  emit('submit', formData)
}
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="title" 
    maxWidthClass="max-w-[520px]"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <!-- Book Cover Field -->
      <div class="space-y-1.5 text-left">
        <label class="block text-sm font-medium text-slate-700">Book Cover</label>
        
        <!-- State EMPTY -->
        <div 
          v-if="!bookCoverPreview"
          @click="triggerCoverUpload"
          class="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center min-h-[160px] p-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors duration-200 select-none"
        >
          <ImagePlus class="w-8 h-8 text-slate-300" />
          <span class="text-sm text-slate-500 mt-2 font-medium">Click to upload book cover</span>
          <span class="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB · 3:4 ratio recommended</span>
        </div>

        <!-- State PREVIEW -->
        <div 
          v-else
          class="border border-slate-200 rounded-xl flex flex-col items-center justify-center p-2 select-none bg-slate-50/50"
        >
          <div class="relative w-full max-h-48 overflow-hidden rounded-lg group flex justify-center bg-slate-100">
            <img 
              :src="bookCoverPreview" 
              class="object-contain max-h-48 w-auto rounded-lg" 
              alt="Book Cover Preview"
            />
            <!-- Hover Overlay -->
            <div 
              @click="triggerCoverUpload"
              class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            >
              <Camera class="w-6 h-6 text-white" />
            </div>
          </div>
          
          <!-- Remove Cover Button -->
          <button 
            type="button" 
            @click="removeCover" 
            class="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-2 font-medium"
          >
            <X class="w-3 h-3" />
            <span>Remove cover</span>
          </button>
        </div>

        <!-- Hidden File Input -->
        <input
          type="file"
          accept="image/jpeg,image/png"
          class="hidden"
          ref="coverInput"
          @change="handleCoverUpload"
        />

        <!-- Error display -->
        <div v-if="coverError" class="text-xs text-red-600 mt-1.5 flex items-center gap-1">
          <AlertCircle class="w-3 h-3 shrink-0" />
          <span>{{ coverError }}</span>
        </div>
      </div>

      <!-- Title Field -->
      <BaseInput 
        v-model="form.title"
        label="Title"
        required
        placeholder="Enter book title"
        :error="errors?.title"
      />

      <!-- Author Selection dropdown -->
      <div class="space-y-1.5 text-left">
        <label class="block text-sm font-medium text-slate-700">
          Author <span class="text-red-500">*</span>
        </label>

        <!-- Loading state dropdown -->
        <div
          v-if="loadingAuthors"
          class="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-400 flex items-center gap-2"
        >
          <svg class="animate-spin w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading authors...
        </div>

        <!-- Error state dropdown -->
        <div
          v-else-if="authorFetchError"
          class="w-full border border-red-200 bg-white rounded-lg px-3 py-2 text-sm text-red-500 flex items-center justify-between"
        >
          <span>Failed to load authors.</span>
          <button
            type="button"
            @click="fetchAuthorOptions"
            class="text-xs text-blue-600 hover:underline ml-2 font-medium"
          >
            Retry
          </button>
        </div>

        <!-- Select dropdown — tampil jika data sudah ada -->
        <div v-else class="relative">
          <select
            v-model="form.author_id"
            class="w-full appearance-none border rounded-lg px-3 py-2 text-sm pr-9 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white"
            :class="errors?.author_id
              ? 'border-red-400 ring-2 ring-red-100'
              : 'border-slate-200'"
          >
            <option value="" disabled>
              Select an author...
            </option>
            <option
              v-for="author in authorOptions"
              :key="author.id"
              :value="author.id"
            >
              {{ author.name }}
            </option>
          </select>

          <!-- Custom chevron icon -->
          <ChevronDown
            class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          />
        </div>

        <!-- Tidak ada author di database -->
        <p
          v-if="!loadingAuthors && !authorFetchError && authorOptions.length === 0"
          class="text-xs text-amber-600 mt-1"
        >
          Belum ada author di database.
          <NuxtLink to="/authors" class="underline">Tambah author terlebih dahulu.</NuxtLink>
        </p>

        <!-- Validation error -->
        <p v-if="errors?.author_id" class="text-xs text-red-600 mt-1">
          {{ errors.author_id }}
        </p>
      </div>

      <!-- ISBN Field (monospace) -->
      <BaseInput 
        v-model="form.isbn"
        label="ISBN"
        required
        mono
        placeholder="e.g. 978-0-061-96436-9"
        :error="errors?.isbn"
      />

      <!-- Published Year & Status Grid -->
      <div class="grid grid-cols-2 gap-4">
        <BaseInput 
          v-model="form.published_year"
          label="Published year"
          required
          type="number"
          placeholder="e.g. 2023"
          :error="errors?.published_year"
        />

        <!-- Status select -->
        <div class="space-y-1.5 text-left">
          <label class="block text-sm font-medium text-slate-700">
            Status <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.status"
            class="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none transition-colors"
            :class="[
              errors?.status ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500',
              form.status === 'AVAILABLE' ? 'bg-green-50 text-green-700' : 
              form.status === 'LOANED' ? 'bg-amber-50 text-amber-700' : 
              'bg-red-50 text-red-700'
            ]"
          >
            <option value="AVAILABLE" class="bg-white text-slate-900">Available</option>
            <option value="LOANED" class="bg-white text-slate-900">Loaned</option>
            <option value="RESERVED" class="bg-white text-slate-900">Reserved</option>
          </select>
          <p v-if="errors?.status" class="text-xs text-red-600 mt-1">{{ errors.status }}</p>
        </div>
      </div>

      <!-- Description Field -->
      <div class="space-y-1.5 text-left">
        <label class="block text-sm font-medium text-slate-700">
          Description
          <span class="text-slate-400 font-normal ml-0.5">(optional)</span>
        </label>
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="Enter a short description of the book..."
          class="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-150"
          :class="{ 'border-red-400 focus:ring-red-100': errors?.description }"
        />
        <div class="flex justify-between items-center text-xs">
          <span class="text-red-600">{{ errors?.description }}</span>
          <span class="text-slate-400 ml-auto">Max 2000 characters.</span>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')" class="w-full md:w-auto">
        Cancel
      </BaseButton>
      <BaseButton variant="primary" :loading="submitting" @click="submitForm" class="w-full md:w-auto">
        {{ book ? 'Save changes' : 'Add book' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
