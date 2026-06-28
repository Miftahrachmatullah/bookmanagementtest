// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: 'app/',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/main.css'
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000/api/v1'
    }
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://127.0.0.1:8000/api',
        changeOrigin: true,
      }
    }
  }
})

