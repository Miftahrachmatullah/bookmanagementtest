<script setup lang="ts">
import { AlertTriangle, Trash2 } from 'lucide-vue-next'
import BaseModal from '../base/BaseModal.vue'
import BaseButton from '../base/BaseButton.vue'

interface Props {
  show?: boolean
  title?: string
  heading?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  show: false,
  title: 'Delete',
  heading: 'Are you sure?',
  message: 'This action cannot be undone.',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  loading: false
})

defineEmits(['confirm', 'close'])
</script>

<template>
  <BaseModal :show="show" :title="title" @close="$emit('close')" maxWidthClass="max-w-[400px]">
    <div class="flex flex-col items-center pt-1 text-center">
      <!-- Warning Icon Container -->
      <div class="bg-amber-50 rounded-xl p-3 w-fit mb-4 text-amber-600">
        <AlertTriangle class="w-7 h-7" />
      </div>

      <!-- Heading -->
      <h3 class="text-[15px] font-semibold text-slate-900 leading-snug">
        {{ heading }}
      </h3>

      <!-- Body Text -->
      <p class="text-sm text-slate-500 mt-2 font-normal leading-relaxed">
        {{ message }}
      </p>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="$emit('close')">
        {{ cancelText }}
      </BaseButton>
      <BaseButton 
        variant="danger"
        :loading="loading"
        @click="$emit('confirm')"
      >
        <Trash2 v-if="!loading" class="w-4 h-4 mr-1.5 inline-block shrink-0" />
        <span>{{ confirmText }}</span>
      </BaseButton>
    </template>
  </BaseModal>
</template>
