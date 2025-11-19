import { Webhooks } from '@polar-sh/remix'

export const action = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log('polar webhook payload', payload)
  },
  onOrderPaid: async (payload) => {
    // Example: mark order paid in your DB
    console.log('order paid', payload)
  },
})
