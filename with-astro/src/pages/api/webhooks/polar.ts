import { Webhooks } from '@polar-sh/astro'
import { POLAR_WEBHOOK_SECRET } from 'astro:env/server'

export const POST = Webhooks({
  webhookSecret: POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    console.log(payload)
  },
})
