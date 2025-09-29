import { envField } from 'astro/config'
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'

const externals = [
  'buffer',
  'path',
  'fs/promises',
  'timers/promises',
  'fs',
  'http2',
  'process',
  'os',
  'crypto',
  'async_hooks',
  'util',
  'zlib',
  'https',
  'events',
  'dns',
  'stream',
  'querystring',
  'assert',
  'child_process',
  'url',
  'net',
  'tls',
  'http',
  'timers',
  'tty',
]

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
  },
  preview: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
  },
  output: 'server',
  adapter: cloudflare(),
  vite: {
    ssr: {
      external: externals.map((i) => `node:${i}`),
    },
    resolve: {
      alias: Object.fromEntries(externals.map((ext) => [ext, `node:${ext}`])),
    },
  },
  env: {
    schema: {
      POLAR_OAT: envField.string({ optional: false, access: 'secret', context: 'server' }),
      POLAR_MODE: envField.string({ optional: false, access: 'secret', context: 'server' }),
    },
  },
})
