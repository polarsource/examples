import { Polar } from '@polar-sh/sdk'
import { POLAR_OAT, POLAR_MODE } from 'astro:env/server'

const accessToken = POLAR_OAT
if (!accessToken) throw new Error(`Missing POLAR_OAT environment variable`)

export const polar = new Polar({
  accessToken,
  server: POLAR_MODE as 'sandbox' | 'production',
})
