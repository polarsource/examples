// api/webhook/polar/route.ts
import { Webhooks } from '@polar-sh/nextjs'
import { NextResponse } from 'next/server'

export const POST = async () => {
  if (!process.env.POLAR_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Polar web secret is not found.' }, { status: 400 })
  }
  Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
    onPayload: async (payload) => {
      // Handle the payload
      // No need to return an acknowledge response
    },
    onOrderPaid: async (event) => {},
  })

  return NextResponse.json({}, { status: 200 })
}
