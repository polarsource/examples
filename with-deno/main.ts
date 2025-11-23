import 'npm:@dotenvx/dotenvx/config'
import { Checkout, CustomerPortal, Webhooks } from 'jsr:@polar-sh/deno'
import { Polar } from 'npm:@polar-sh/sdk'
import { z } from 'npm:zod'

const envSchema = z.object({
  POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  POLAR_SUCCESS_URL: z.url('POLAR_SUCCESS_URL must be a valid URL').optional(),
})

const env = envSchema.parse(Deno.env.toObject())

const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_MODE,
})

async function router(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const pathname = url.pathname
  const method = req.method

  if (pathname === '/' && method === 'GET') {
    const products = await polar.products.list({
      isArchived: false,
    })

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

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  if (pathname === '/polar/webhooks' && method === 'POST') {
    return Webhooks({
      webhookSecret: env.POLAR_WEBHOOK_SECRET,
      onPayload: (payload) => {
        console.log(payload)
      },
    })(req)
  }

  if (pathname === '/checkout' && method === 'GET') {
    return Checkout({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: env.POLAR_MODE,
      includeCheckoutId: true,
      successUrl: env.POLAR_SUCCESS_URL,
    })(req)
  }

  if (pathname === '/portal' && method === 'GET') {
    return CustomerPortal({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: env.POLAR_MODE,
      getCustomerId: async (req: Request) => {
        const url = new URL(req.url)
        const email = url.searchParams.get('email')
        if (!email) throw new Error('Missing email')
        const customer = await polar.customers.list({
          email,
        })
        return customer.result.items[0]?.id || ''
      },
    })(req)
  }

  return new Response('Not Found', { status: 404 })
}

Deno.serve({ port: 3000 }, router)
