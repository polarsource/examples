import env from '@/lib/env'
import { Checkout } from '@polar-sh/nextjs'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return await Checkout({
    server: env.POLAR_MODE,
    successUrl: env.POLAR_SUCCESS_URL,
    accessToken: env.POLAR_ACCESS_TOKEN,
  })(req)
}
