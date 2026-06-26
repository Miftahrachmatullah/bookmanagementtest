<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, useId } from 'vue'
import { ChevronDown, Check, Search } from 'lucide-vue-next'

interface Option {
  value: string | number
  label: string
}

interface Props {
  options: Option[]
  label?: string
  required?: boolean
  placeholder?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  required: false,
  placeholder: 'Select an option',
  error: '',
  disabled: false,
  searchable: true
})

const model = defineModel<string | number | null>()

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)
const selectId = useId()

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === model.value)
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(opt => opt.label.toLowerCase().includes(q))
})

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

const selectOption = (opt: Option) => {
  model.value = opt.value
  isOpen.value = false
}

const handleClickOutside = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="space-y-1.5 w-full text-left relative">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div
      :id="selectId"
      @click="toggleDropdown"
      class="w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg flex items-center justify-between cursor-pointer select-none transition-all duration-150"
      :class="[
        disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : '',
        error 
          ? 'border-red-400 ring-2 ring-red-100 focus:border-red-500' 
          : isOpen 
            ? 'border-blue-500 ring-2 ring-blue-100' 
            : 'border-slate-200 hover:border-slate-300'
      ]"
    >
      <span v-if="selectedOption" class="text-slate-900 truncate">
        {{ selectedOption.label }}
      </span>
      <span v-else class="text-slate-400 truncate">
        {{ placeholder }}
      </span>
      <ChevronDown class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </div>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 overflow-hidden"
      >
        <!-- Search bar inside dropdown -->
        <div v-if="searchable" class="px-2 py-1.5 border-b border-slate-100 relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            @click.stop
          />
        </div>

        <ul class="max-h-60 overflow-y-auto divide-y divide-slate-50">
          <li
            v-for="opt in filteredOptions"
            :key="opt.value"
            @click.stop="selectOption(opt)"
            class="px-3 py-2 text-[13px] flex items-center justify-between cursor-pointer select-none transition-colors duration-100 hover:bg-slate-50"
            :class="{
              'bg-blue-50 text-blue-700 font-medium hover:bg-blue-50': model === opt.value
            }"
          >
            <span class="truncate">{{ opt.label }}</span>
            <Check v-if="model === opt.value" class="w-4 h-4 text-blue-700 shrink-0" />
          </li>
          <li v-if="filteredOptions.length === 0" class="px-3 py-2.5 text-xs text-slate-400 text-center">
            No matches found
          </li>
        </ul>
      </div>
    </Transition>

    <p v-if="error" class="text-xs text-red-600 mt-1">
      {{ error }}
    </p>
  </div>
</template>
