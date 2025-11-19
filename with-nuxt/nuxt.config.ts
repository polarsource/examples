import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  runtimeConfig: {
    accessToken: process.env.POLAR_ACCESS_TOKEN,
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
    mode: process.env.POLAR_MODE,
    polarSuccessUrl: process.env.POLAR_SUCCESS_URL,
    public: {},
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['.ngrok-free.app'],
    },
  },
  modules: ['@polar-sh/nuxt', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Polar with Nuxt Example',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          href: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap',
          rel: 'stylesheet',
        },
      ],
    },
  },
})
