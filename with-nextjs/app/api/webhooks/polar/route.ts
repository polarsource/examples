import { Webhooks } from '@polar-sh/nextjs'
import { NextResponse } from 'next/server'

export const POST = async () => {
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      {
        message: `POLAR_WEBHOOK_SECRET token is not found.`,
      },
      { status: 400 },
    )
  }
  Webhooks({
    webhookSecret: webhookSecret,
    onPayload: async (payload) => {
      // Handle the payload
      // No need to return an acknowledge response
    },
    onOrderPaid: async (event) => {},
  })

  return NextResponse.json({}, { status: 200 })
}
