import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, envField } from 'astro/config'

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  env: {
    schema: {
      POLAR_OAT: envField.string({
        context: 'server',
        access: 'secret',
      }),
      POLAR_WEBHOOK_SECRET: envField.string({
        context: 'server',
        access: 'secret',
      }),
      POLAR_SUCCESS_URL: envField.string({
        context: 'server',
        access: 'public',
      }),
      POLAR_MODE: envField.string({
        context: 'server',
        access: 'secret',
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: [
        '.ngrok-free.app', // e.g when testing on local ensure to set your forwarding URL
      ],
    },
  },
})
