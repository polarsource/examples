import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  plugins: [
    nitro(),
    devtools(),
    viteReact(),
    tailwindcss(),
    tanstackStart(),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
  ],
  server: {
    allowedHosts: ['.ngrok-free.app'],
  },
})

export default config
