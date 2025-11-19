import { polar } from '@/lib/polar'
import { CustomerPortal } from '@polar-sh/nextjs'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN
  const server = process.env.POLAR_MODE as 'sandbox' | 'production'
  if (!server) throw new Error('POLAR_MODE is not set')
  if (!accessToken) throw new Error('POLAR_ACCESS_TOKEN is not set')
  return await CustomerPortal({
    server,
    accessToken,
    getCustomerId: async (req: NextRequest) => {
      const email = req.nextUrl.searchParams.get('email')
      const customer = await polar.customers.list({
        email,
      })
      return customer.result.items[0].id
    },
  })(req)
}
