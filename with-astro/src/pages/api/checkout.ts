import { Checkout } from '@polar-sh/astro'
import { POLAR_MODE, POLAR_ACCESS_TOKEN, POLAR_SUCCESS_URL } from 'astro:env/server'

if (!POLAR_ACCESS_TOKEN) throw new Error('Missing POLAR_ACCESS_TOKEN environment variable')

export const GET = Checkout({
  successUrl: POLAR_SUCCESS_URL,
  accessToken: POLAR_ACCESS_TOKEN,
  server: POLAR_MODE as 'sandbox' | 'production',
})
