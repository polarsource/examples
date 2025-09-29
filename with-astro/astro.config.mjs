import { defineConfig, envField } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import vercel from '@astrojs/vercel'

export default defineConfig({
  output: 'server',
  env: {
    schema: {
      POLAR_ACCESS_TOKEN: envField.string({
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
      SANDBOX_POLAR_ACCESS_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
      }),
      SANDBOX_POLAR_WEBHOOK_SECRET: envField.string({
        context: 'server',
        access: 'secret',
      }),
      SANDBOX_POLAR_SUCCESS_URL: envField.string({
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

  integrations: [],
  adapter: vercel(),
})
