import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiBase as string,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 10000,
  })

  // Log response error untuk mempermudah debug
  api.interceptors.response.use(
    response => response,
    error => {
      console.error('[Axios Error]', error.response?.status, error.response?.data || error.message)
      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api
    }
  }
})
