<script setup lang="ts">
import { ref, watch } from 'vue'
import { ImagePlus, Camera, X, AlertCircle } from 'lucide-vue-next'
import BaseModal from '../base/BaseModal.vue'
import BaseInput from '../base/BaseInput.vue'
import BaseButton from '../base/BaseButton.vue'

interface Props {
  show: boolean
  title: string
  author?: any // existing author details if in edit mode
  errors?: Record<string, string>
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({}),
  submitting: false
})

const emit = defineEmits(['close', 'submit'])

// Form fields state
const form = ref({
  name: '',
  email: '',
  birth_date: '',
  bio: ''
})

const localErrors = ref<Record<string, string>>({})

// Photo upload states
const profilePhoto = ref<File | null>(null)
const profilePhotoPreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const photoError = ref<string | null>(null)
const photoRemoved = ref(false)

function triggerUpload() {
  fileInput.value?.click()
}

function handlePhotoUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    photoError.value = 'Only JPG and PNG files are allowed.'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    photoError.value = 'File size must be less than 2MB.'
    return
  }

  photoError.value = null
  profilePhoto.value = file
  profilePhotoPreview.value = URL.createObjectURL(file)
  photoRemoved.value = false
}

function removePhoto() {
  profilePhoto.value = null
  profilePhotoPreview.value = null
  photoError.value = null
  photoRemoved.value = true
  if (fileInput.value) fileInput.value.value = ''
}

// Reset form and photo states when modal show toggles
watch(() => props.show, (newVal) => {
  if (newVal) {
    profilePhoto.value = null
    photoError.value = null
    photoRemoved.value = false
    localErrors.value = {}
    
    if (props.author) {
      // Prefill fields for Edit mode
      form.value = {
        name: props.author.name || '',
        email: props.author.email || '',
        birth_date: props.author.birth_date ? props.author.birth_date.split('T')[0] : '',
        bio: props.author.bio || ''
      }
      profilePhotoPreview.value = props.author.profile_photo_url || null
    } else {
      // Clear fields for Add mode
      form.value = {
        name: '',
        email: '',
        birth_date: '',
        bio: ''
      }
      profilePhotoPreview.value = null
    }
  }
})

function submitForm() {
  localErrors.value = {}
  let hasError = false

  if (!form.value.name.trim()) {
    localErrors.value.name = 'Name is required.'
    hasError = true
  }

  if (!form.value.email.trim()) {
    localErrors.value.email = 'Email is required.'
    hasError = true
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    localErrors.value.email = 'Please enter a valid email address.'
    hasError = true
  }

  if (!form.value.birth_date) {
    localErrors.value.birth_date = 'Birth date is required.'
    hasError = true
  }

  if (hasError) {
    return
  }

  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('email', form.value.email)
  formData.append('birth_date', form.value.birth_date)
  if (form.value.bio) {
    formData.append('bio', form.value.bio)
  }
  
  if (profilePhoto.value) {
    formData.append('profile_photo', profilePhoto.value)
  } else if (photoRemoved.value) {
    formData.append('profile_photo_remove', '1')
  }

  emit('submit', formData)
}
</script>

<template>
  <BaseModal 
    :show="show" 
    :title="title" 
    @close="emit('close')"
  >
    <div class="space-y-4">
      <!-- Profile Photo Upload Zone -->
      <div class="space-y-1.5 text-left">
        <label class="block text-sm font-medium text-slate-700">Profile Photo</label>
        
        <!-- State EMPTY -->
        <div 
          v-if="!profilePhotoPreview"
          @click="triggerUpload"
          class="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center min-h-[140px] p-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors duration-200 select-none"
        >
          <ImagePlus class="w-8 h-8 text-slate-300" />
          <span class="text-sm text-slate-500 mt-2 font-medium">Click to upload photo</span>
          <span class="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</span>
        </div>

        <!-- State PREVIEW -->
        <div 
          v-else
          class="border border-slate-200 rounded-xl flex flex-col items-center justify-center p-5 select-none bg-slate-50/50"
        >
          <div class="relative w-24 h-24 group rounded-full overflow-hidden">
            <img 
              :src="profilePhotoPreview" 
              class="object-cover rounded-full w-24 h-24 border-2 border-slate-200" 
              alt="Profile Photo Preview"
            />
            <!-- Hover Overlay -->
            <div 
              @click="triggerUpload"
              class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            >
              <Camera class="w-6 h-6 text-white" />
            </div>
          </div>
          
          <!-- Remove Photo Button -->
          <button 
            type="button" 
            @click="removePhoto" 
            class="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-2 font-medium"
          >
            <X class="w-3 h-3" />
            <span>Remove photo</span>
          </button>
        </div>

        <!-- Hidden File Input -->
        <input
          type="file"
          accept="image/jpeg,image/png"
          class="hidden"
          ref="fileInput"
          @change="handlePhotoUpload"
        />

        <!-- Error display -->
        <div v-if="photoError" class="text-xs text-red-600 mt-1.5 flex items-center gap-1">
          <AlertCircle class="w-3 h-3 shrink-0" />
          <span>{{ photoError }}</span>
        </div>
      </div>

      <!-- Name Field -->
      <BaseInput 
        v-model="form.name"
        label="Name"
        required
        placeholder="Enter full name"
        :error="localErrors.name || errors?.name"
      />

      <!-- Email Field -->
      <BaseInput 
        v-model="form.email"
        label="Email address"
        required
        placeholder="author@example.com"
        :error="localErrors.email || errors?.email"
        id="author-email-input"
      />

      <!-- Birth Date Field -->
      <BaseInput 
        v-model="form.birth_date"
        label="Birth date"
        required
        type="date"
        :error="localErrors.birth_date || errors?.birth_date"
      />

      <!-- Bio Field (optional) -->
      <div class="space-y-1.5 text-left">
        <label class="block text-sm font-medium text-slate-700">
          Bio
          <span class="text-slate-400 font-normal ml-0.5">(optional)</span>
        </label>
        <textarea
          v-model="form.bio"
          rows="3"
          placeholder="Write a short biography..."
          class="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-150"
          :class="{ 'border-red-400 focus:ring-red-100': localErrors.bio || errors?.bio }"
        />
        <div class="flex justify-between items-center text-xs">
          <span class="text-red-600">{{ localErrors.bio || errors?.bio }}</span>
          <span class="text-slate-400 ml-auto">Max 1000 characters.</span>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')" class="w-full md:w-auto">
        Cancel
      </BaseButton>
      <BaseButton variant="primary" :loading="submitting" @click="submitForm" class="w-full md:w-auto">
        {{ author ? 'Save changes' : 'Add author' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
