<script setup lang="ts">
import { useId } from 'vue'

interface Props {
  label?: string
  required?: boolean
  type?: string
  placeholder?: string
  error?: string
  hint?: string
  id?: string
  mono?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  required: false,
  type: 'text',
  placeholder: '',
  error: '',
  hint: '',
  id: '',
  mono: false
})

const model = defineModel<string | number>()
const inputId = props.id || useId()
</script>

<template>
  <div class="space-y-1.5 w-full text-left">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <input
      :id="inputId"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg placeholder:text-slate-400 focus:outline-none transition-all duration-150"
      :class="[
        mono ? 'font-mono text-[13px] text-slate-600' : 'text-slate-900',
        error 
          ? 'border-red-400 ring-2 ring-red-100 focus:ring-red-100 focus:border-red-500' 
          : 'border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
      ]"
    />
    
    <p v-if="error" class="text-xs text-red-600 mt-1">
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-slate-500 mt-1">
      {{ hint }}
    </p>
  </div>
</template>
