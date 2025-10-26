import { Polar } from '@polar-sh/sdk'
import { POLAR_ACCESS_TOKEN, SANDBOX_POLAR_ACCESS_TOKEN, POLAR_MODE } from 'astro:env/server'

type PolarMode = 'production' | 'sandbox' | undefined

const accessToken = POLAR_MODE === 'sandbox' ? SANDBOX_POLAR_ACCESS_TOKEN : POLAR_ACCESS_TOKEN

if (!accessToken) {
  throw new Error(`Missing POLAR_ACCESS_TOKEN or SANDBOX_POLAR_ACCESS_TOKEN environment variable`)
}

export const polarClient = new Polar({
  accessToken,
  server: POLAR_MODE as PolarMode,
})
