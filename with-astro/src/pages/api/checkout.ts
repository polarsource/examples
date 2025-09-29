import { Checkout } from '@polar-sh/astro'
import { POLAR_ACCESS_TOKEN, POLAR_MODE, POLAR_SUCCESS_URL, SANDBOX_POLAR_ACCESS_TOKEN, SANDBOX_POLAR_SUCCESS_URL } from 'astro:env/server'

const isSandbox = POLAR_MODE === "sandbox";

const accessToken = isSandbox ? SANDBOX_POLAR_ACCESS_TOKEN : POLAR_ACCESS_TOKEN;
const successUrl = isSandbox ? SANDBOX_POLAR_SUCCESS_URL : POLAR_SUCCESS_URL;

type PolarMode = 'sandbox' | 'production' | undefined

if (!accessToken) {
  throw new Error(`Missing POLAR_ACCESS_TOKEN or SANDBOX_POLAR_ACCESS_TOKEN environment variable`)
}

export const GET = Checkout({
  accessToken,
  successUrl,
  server: POLAR_MODE as PolarMode,
  theme: 'light', // optional
})
