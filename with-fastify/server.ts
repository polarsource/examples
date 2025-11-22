import Fastify from 'fastify'
import { Checkout, CustomerPortal, Webhooks } from '@polar-sh/fastify'
import { z } from 'zod'
import '@dotenvx/dotenvx/config'
import { Polar } from '@polar-sh/sdk'

const envSchema = z.object({
  POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  POLAR_SUCCESS_URL: z.string().url('POLAR_SUCCESS_URL must be a valid URL').optional(),
})

const env = envSchema.parse(process.env)

const polar = new Polar({ accessToken: env.POLAR_ACCESS_TOKEN, server: env.POLAR_MODE })

const fastify = Fastify()

// Home route
fastify.get('/', async function handler(request, reply) {
  const products = await polar.products.list({
    isArchived: false,
  })
  reply.type('text/html')
  return `<html><body>
    <form action="/portal" method="get">
      <input type="email" name="email" placeholder="Email" required />
      <button type="submit">Open Customer Portal</button>
    </form>
    ${products.result.items.map((product) => `<div><a target="_blank" href="/checkout?products=${product.id}">${product.name}</a></div>`).join('')}</body></html>`
})

// Polar Checkout route
// Usage: /checkout?products=123&customerId=xxx&customerEmail=email@example.com
fastify.get(
  '/checkout',
  Checkout({
    server: env.POLAR_MODE,
    includeCheckoutId: true,
    successUrl: env.POLAR_SUCCESS_URL,
    accessToken: env.POLAR_ACCESS_TOKEN,
  }),
)

// Polar Customer Portal route
fastify.get(
  '/portal',
  CustomerPortal({
    server: env.POLAR_MODE,
    accessToken: env.POLAR_ACCESS_TOKEN,
    getCustomerId: async (req) => {
      const email = new URL(req.originalUrl, 'https://a.b').searchParams.get('email')
      const customer = await polar.customers.list({
        email,
      })
      return customer.result.items[0].id
    },
  }),
)

// Polar Webhooks endpoint
fastify.post(
  '/polar/webhooks',
  Webhooks({
    webhookSecret: env.POLAR_WEBHOOK_SECRET,
    onPayload: async (payload) => {
      console.log(payload)
    },
  }),
)

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
