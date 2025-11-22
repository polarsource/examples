// routes/api/checkout.ts
import { env } from '@/config/env'
import { Checkout } from '@polar-sh/tanstack-start'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/checkout')({
  server: {
    handlers: {
      GET: Checkout({
        accessToken: env.POLAR_ACCESS_TOKEN,
        successUrl: env.POLAR_SUCCESS_URL,
        returnUrl: 'http://localhost:3000',
        server: env.POLAR_MODE,
        includeCheckoutId: false,
        theme: 'dark',
      }),
    },
  },
})
