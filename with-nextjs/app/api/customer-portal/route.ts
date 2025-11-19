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
    getCustomerId: (req: NextRequest) => {},
  })(req)
}
