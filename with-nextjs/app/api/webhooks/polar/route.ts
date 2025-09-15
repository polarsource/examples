import { Webhooks } from '@polar-sh/nextjs'
import { NextResponse } from 'next/server'

export const POST = async () => {
  const webhookSecret =
    process.env.NEXT_PUBLIC_POLAR_MODE === 'production' ? process.env.NEXT_PUBLIC_PRODUCTION_POLAR_WEBHOOK_SECRET : process.env.NEXT_PUBLIC_SANDBOX_POLAR_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      {
        message: `${process.env.NEXT_PUBLIC_POLAR_MODE === 'production' ? 'NEXT_PUBLIC_PRODUCTION_POLAR_WEBHOOK_SECRET' : 'NEXT_PUBLIC_SANDBOX_POLAR_WEBHOOK_SECRET'} token is not found.`,
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
