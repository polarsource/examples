import { Checkout } from '@polar-sh/astro'
import { POLAR_ACCESS_TOKEN, POLAR_MODE, POLAR_SUCCESS_URL, SANDBOX_POLAR_ACCESS_TOKEN } from 'astro:env/server'

const accessToken = POLAR_MODE === 'sandbox' ? SANDBOX_POLAR_ACCESS_TOKEN : POLAR_ACCESS_TOKEN

type PolarMode = 'sandbox' | 'production' | undefined

if (!accessToken) {
  throw new Error(`Missing POLAR_ACCESS_TOKEN or SANDBOX_POLAR_ACCESS_TOKEN environment variable`)
}

export const GET = Checkout({
  accessToken,
  successUrl: POLAR_SUCCESS_URL,
  server: POLAR_MODE as PolarMode,
  theme: 'light', // optional
})
