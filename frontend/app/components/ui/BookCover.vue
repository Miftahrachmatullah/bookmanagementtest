<script setup lang="ts">
import { computed } from 'vue'
import { 
  Book, 
  AlignLeft, 
  Grid, 
  Database, 
  Wind, 
  Cpu, 
  Compass, 
  Layers, 
  Clock, 
  Code,
  FileText,
  BookOpen
} from 'lucide-vue-next'

interface Props {
  title: string
  size?: 'xs' | 'sm' | 'md' // xs = 36x46px, sm = 40x52px, md = 44x56px
  coverUrl?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

// Determine cover colors and icon based on book title to match the screenshot spec
const coverStyle = computed(() => {
  const t = props.title.toLowerCase()
  if (t.includes("architect's logic")) {
    return {
      gradient: 'from-slate-800 to-blue-950',
      icon: Book,
      colorClass: 'text-blue-300'
    }
  }
  if (t.includes("silent patterns")) {
    return {
      gradient: 'from-zinc-800 to-zinc-950',
      icon: AlignLeft,
      colorClass: 'text-zinc-400'
    }
  }
  if (t.includes("urban flow")) {
    return {
      gradient: 'from-teal-900 to-slate-950',
      icon: Grid,
      colorClass: 'text-teal-300'
    }
  }
  if (t.includes("data structures")) {
    return {
      gradient: 'from-slate-700 to-slate-900',
      icon: Database,
      colorClass: 'text-slate-300'
    }
  }
  if (t.includes("whisper of the wind")) {
    return {
      gradient: 'from-rose-950 to-red-900',
      icon: Wind,
      colorClass: 'text-red-300'
    }
  }
  if (t.includes("neural networks")) {
    return {
      gradient: 'from-teal-950 to-slate-900',
      icon: Cpu,
      colorClass: 'text-teal-400'
    }
  }
  if (t.includes("last meridian")) {
    return {
      gradient: 'from-purple-900 to-indigo-950',
      icon: Compass,
      colorClass: 'text-purple-300'
    }
  }
  if (t.includes("concrete dreams")) {
    return {
      gradient: 'from-emerald-950 to-slate-950',
      icon: Layers,
      colorClass: 'text-emerald-300'
    }
  }
  if (t.includes("shadows in motion")) {
    return {
      gradient: 'from-red-950 to-stone-900',
      icon: Clock,
      colorClass: 'text-stone-300'
    }
  }
  if (t.includes("beyond the binary")) {
    return {
      gradient: 'from-amber-950 to-orange-900',
      icon: Code,
      colorClass: 'text-orange-300'
    }
  }
  // Default fallback cover
  return {
    gradient: 'from-slate-800 to-blue-900',
    icon: FileText,
    colorClass: 'text-slate-300'
  }
})
</script>

<template>
  <div
    class="flex items-center justify-center shadow-sm relative overflow-hidden select-none shrink-0"
    :class="[
      coverUrl ? 'bg-slate-100' : 'bg-slate-200',
      size === 'xs' ? 'w-9 h-[46px] rounded' : size === 'sm' ? 'w-10 h-[52px] rounded-md' : 'w-11 h-[56px] rounded-md'
    ]"
  >
    <img 
      v-if="coverUrl" 
      :src="coverUrl" 
      class="w-full h-full object-cover" 
      alt="Cover" 
    />
    <BookOpen v-else class="w-5 h-5 text-slate-400" />
  </div>
</template>
