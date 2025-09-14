import { Webhooks } from '@polar-sh/nextjs'
import { NextResponse } from 'next/server'

export const POST = async () => {
  const token = process.env.NODE_ENV === 'production' ? process.env.POLAR_WEBHOOK_SECRET : process.env.POLAR_SANDBOX_WEBHOOK_SECRET
  if (!token) {
    return NextResponse.json({ message: 'Polar web secret is not found.' }, { status: 400 })
  }
  Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

    // onPayload: async (payload) => {
    // Handle the payload
    // },
    // onOrderPaid: async (event) => { },

  })

  return NextResponse.json({}, { status: 200 })
}
