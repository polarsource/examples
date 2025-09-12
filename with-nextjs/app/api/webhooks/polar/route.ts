// api/webhook/polar/route.ts
import { Webhooks } from '@polar-sh/nextjs'

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log('Webhook is triggered -  :) ',payload)
  },
  onOrderPaid: async (event) => {
    console.log('Webhook -> Order paid event:', event)
  },
})
