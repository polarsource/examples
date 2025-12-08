import env from '@/lib/env'
import { polar } from '@/lib/polar'
import { CustomerPortal } from '@polar-sh/nextjs'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return await CustomerPortal({
    server: env.POLAR_MODE,
    accessToken: env.POLAR_ACCESS_TOKEN,
    getCustomerId: async (req: NextRequest) => {
      const email = req.nextUrl.searchParams.get('email')
      const customer = await polar.customers.list({ email })
      return customer.result.items[0].id
    },
  })(req)
}
