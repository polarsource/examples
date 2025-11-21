import { z } from 'zod'
import express from 'express'
import '@dotenvx/dotenvx/config'
import { Polar } from '@polar-sh/sdk'
import { Checkout, Webhooks, CustomerPortal } from '@polar-sh/express'

const envSchema = z.object({
  POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  POLAR_SUCCESS_URL: z.string().url('POLAR_SUCCESS_URL must be a valid URL').optional(),
})

const env = envSchema.parse(process.env)

const polar = new Polar({ accessToken: env.POLAR_ACCESS_TOKEN, server: env.POLAR_MODE })

const app = express()

app.use(express.json())

app.post(
  '/polar/webhooks',
  Webhooks({
    webhookSecret: env.POLAR_WEBHOOK_SECRET,
    onPayload: async (payload) => {
      console.log(payload)
    },
  }),
)

app.get(
  '/checkout',
  Checkout({
    server: env.POLAR_MODE,
    includeCheckoutId: true,
    successUrl: env.POLAR_SUCCESS_URL,
    accessToken: env.POLAR_ACCESS_TOKEN,
  }),
)

app.get(
  '/portal',
  CustomerPortal({
    server: env.POLAR_MODE,
    accessToken: env.POLAR_ACCESS_TOKEN,
    getCustomerId: async (req) => {
      const email = new URL(req.url).searchParams.get('email')
      const customer = await polar.customers.list({
        email,
      })
      return customer.result.items[0].id
    },
  }),
)

app.listen(3000)

export default app
