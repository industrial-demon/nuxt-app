// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  nitro: {
    preset: 'github_pages'
  },
  app: {
    baseURL: '/nuxt-app/' // Replace with your repository name
  },
  devtools: { enabled: true }
})
