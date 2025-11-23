import { Elysia } from 'elysia'
import '@dotenvx/dotenvx/config'
import { z } from 'zod'
import { Polar } from '@polar-sh/sdk'
import { Checkout, Webhooks, CustomerPortal } from '@polar-sh/elysia'

const envSchema = z.object({
  POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  POLAR_SUCCESS_URL: z.url({ message: 'POLAR_SUCCESS_URL is missing' }).optional(),
})

const env = envSchema.parse(process.env)

const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_MODE,
})

export default new Elysia()
  .get('/', async () => {
    const products = await polar.products.list({ isArchived: false })

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>

  <body class="bg-white flex flex-col items-center justify-center gap-16 min-h-screen">

    <div class="w-[360px] max-w-[90%] flex flex-col gap-3">
      ${products.result.items
        .map(
          (p) => `
          <a 
            href="/checkout?products=${p.id}" 
            target="_blank"
            class="block text-center px-4 py-3 border rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-900 transition"
          >
            Buy ${p.name}
          </a>
        `,
        )
        .join('')}
    </div>

    <form action="/portal" method="get" class="flex gap-2">
      <input 
        type="email" 
        name="email" 
        placeholder="Email"
        required
        class="px-4 py-2 text-base border rounded-lg w-[260px] focus:outline-none focus:border-black"
      />
      <button 
        type="submit" 
        class="px-6 py-2 text-base bg-black text-white rounded-lg hover:opacity-80 transition"
      >
        Continue
      </button>
    </form>

  </body>
</html>
  `

    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  })
  .post(
    '/polar/webhooks',
    Webhooks({
      webhookSecret: env.POLAR_WEBHOOK_SECRET,
      onPayload: async (payload) => {
        console.log('Webhook Received:', payload)
      },
    }),
  )

  .get(
    '/checkout',
    Checkout({
      server: env.POLAR_MODE,
      includeCheckoutId: true,
      successUrl: env.POLAR_SUCCESS_URL,
      accessToken: env.POLAR_ACCESS_TOKEN,
    }),
  )

  .get(
    '/portal',
    CustomerPortal({
      server: env.POLAR_MODE,
      accessToken: env.POLAR_ACCESS_TOKEN,
      getCustomerId: async (ctx) => {
        const email = new URL(ctx.url).searchParams.get('email')
        if (!email) throw new Error('Missing email')

        const customer = await polar.customers.list({ email })
        return customer.result.items[0].id
      },
    }),
  )
