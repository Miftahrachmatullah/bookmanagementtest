<script setup lang="ts">
import { LayoutDashboard, Users, BookOpen, Settings, LogOut } from 'lucide-vue-next'
import ToastNotification from '~/components/ui/ToastNotification.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const handleLogout = () => {
  // Logout not implemented
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-700">
    <!-- Sidebar (240px, fixed left) -->
    <aside class="w-[240px] fixed top-0 bottom-0 left-0 bg-white border-r border-slate-200 hidden md:flex flex-col z-30 shrink-0 select-none">
      <!-- Logo Area -->
      <div class="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
        <!-- Blue Square Icon -->
        <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shrink-0">
          <BookOpen class="w-5 h-5 text-white" />
        </div>
        <div class="flex flex-col min-w-0 leading-none">
          <span class="text-sm font-bold text-slate-900">BookManager</span>
          <span class="text-[11px] text-slate-400 font-medium mt-0.5">Admin Console</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <!-- Dashboard -->
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
          :class="[
            route.path === '/' 
              ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 rounded-l-none' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          ]"
        >
          <LayoutDashboard class="w-4 h-4" />
          <span>Dashboard</span>
        </NuxtLink>

        <!-- Authors -->
        <NuxtLink
          to="/authors"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
          :class="[
            route.path.startsWith('/authors') 
              ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 rounded-l-none' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          ]"
        >
          <Users class="w-4 h-4" />
          <span>Authors</span>
        </NuxtLink>

        <!-- Books -->
        <NuxtLink
          to="/books"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
          :class="[
            route.path.startsWith('/books') 
              ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600 rounded-l-none' 
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          ]"
        >
          <BookOpen class="w-4 h-4" />
          <span>Books</span>
        </NuxtLink>
      </nav>

      <!-- Bottom Section -->
      <div class="p-3 border-t border-slate-200 space-y-1">
        <!-- Version Label -->
        <div class="px-3 py-1 text-[11px] text-slate-400 font-medium">
          v1.0.0
        </div>

        <!-- Settings (disabled – not yet implemented) -->
        <button
          disabled
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 cursor-not-allowed opacity-50 text-left"
        >
          <Settings class="w-4 h-4" />
          <span>Settings</span>
        </button>

        <!-- Logout -->
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-left"
        >
          <LogOut class="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 pl-0 md:pl-[240px] pb-16 md:pb-0 flex flex-col min-h-screen">
      <!-- Main Content Slot -->
      <main class="flex-1 flex flex-col">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 shrink-0 select-none">
        © 2026 Miftah Rachmatullah BookManager Test
      </footer>
    </div>

    <!-- Bottom Navigation Bar (fixed bottom-0) -->
    <nav class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around px-4 py-2 z-30 md:hidden select-none">
      <!-- Dashboard -->
      <NuxtLink
        to="/"
        class="flex flex-col items-center justify-center gap-0.5 text-slate-400"
        :class="{ 'text-blue-600': route.path === '/' }"
      >
        <LayoutDashboard class="w-5 h-5" />
        <span class="text-[10px] font-medium">Dashboard</span>
      </NuxtLink>

      <!-- Authors -->
      <NuxtLink
        to="/authors"
        class="flex flex-col items-center justify-center gap-0.5 text-slate-400"
        :class="{ 'text-blue-600': route.path.startsWith('/authors') }"
      >
        <Users class="w-5 h-5" />
        <span class="text-[10px] font-medium">Authors</span>
      </NuxtLink>

      <!-- Books -->
      <NuxtLink
        to="/books"
        class="flex flex-col items-center justify-center gap-0.5 text-slate-400"
        :class="{ 'text-blue-600': route.path.startsWith('/books') }"
      >
        <BookOpen class="w-5 h-5" />
        <span class="text-[10px] font-medium">Books</span>
      </NuxtLink>
    </nav>

    <!-- Global Toasts -->
    <ToastNotification />
  </div>
</template>
