// routes/api/webhook/polar.ts
import { env } from '@/config/env'
import { Webhooks } from '@polar-sh/tanstack-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/webhooks/polar')({
  server: {
    handlers: {
      POST: Webhooks({
        webhookSecret: env.POLAR_WEBHOOK_SECRET,
        onPayload: async (payload) => {
          // Handle the payload
        },
      }),
    },
  },
})
