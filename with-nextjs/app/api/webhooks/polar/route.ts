import { Webhooks } from '@polar-sh/nextjs'

if (!process.env.POLAR_WEBHOOK_SECRET) throw new Error('POLAR_WEBHOOK_SECRET is not set')

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    console.log(payload)
  },
})
