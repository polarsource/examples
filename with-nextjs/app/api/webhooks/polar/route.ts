import { Webhooks } from '@polar-sh/nextjs'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
  if (!webhookSecret) throw new Error('POLAR_WEBHOOK_SECRET is not set')
  return await Webhooks({ webhookSecret })(req)
}
