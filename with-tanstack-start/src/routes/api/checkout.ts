import { env } from '@/config/env'
import { Checkout } from '@polar-sh/tanstack-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      GET: Checkout({
        server: env.POLAR_MODE,
        includeCheckoutId: false,
        successUrl: env.POLAR_SUCCESS_URL,
        accessToken: env.POLAR_ACCESS_TOKEN,
      }),
    },
  },
})
