import { Hoa } from 'hoa'
import { bodyParser } from '@hoajs/bodyparser'
import { z } from 'zod'
import { Polar } from '@polar-sh/sdk'
import { router } from '@hoajs/router'
import '@dotenvx/dotenvx/config'
import { nodeServer } from '@hoajs/adapter'
import { Webhook } from 'standardwebhooks'

const envSchema = z.object({
  PORT: z.number().default(3000),
  POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  POLAR_SUCCESS_URL: z.url({ message: 'POLAR_SUCCESS_URL is missing' }).optional(),
})

const env = envSchema.parse(process.env)

const polar = new Polar({ accessToken: env.POLAR_ACCESS_TOKEN, server: env.POLAR_MODE })

const app = new Hoa()

app.use(bodyParser())
app.extend(router())
app.extend(nodeServer())

app.get('/', async (ctx, next) => {
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
        required
        type="email" 
        name="email" 
        placeholder="Email"
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
  ctx.res.body = html
})

app.post('/polar/webhooks', async (ctx, next) => {
  const requestBody = await ctx.req.text()
  const webhookHeaders = {
    'webhook-id': ctx.request.headers.get('webhook-id'),
    'webhook-timestamp': ctx.request.headers.get('webhook-timestamp'),
    'webhook-signature': ctx.request.headers.get('webhook-signature'),
  }
  const base64Secret = Buffer.from(env.POLAR_WEBHOOK_SECRET, 'utf-8').toString('base64')
  const webhook = new Webhook(base64Secret)
  try {
    webhook.verify(requestBody, webhookHeaders)
    const payload = JSON.parse(requestBody)
    ctx.res.body = requestBody
  } catch (error) {
    console.log(error.message || error.toString())
    ctx.res.status = 403
    ctx.res.body = error.message || error.toString()
  }
})

app.get('/checkout', async (ctx, next) => {
  const searchParams = new URL(ctx.request.url).searchParams;
  const productIds = Array.from(searchParams.getAll('products'));
  const checkoutSession = await polar.checkouts.create({
    products: typeof productIds === 'string' ? [productIds] : productIds,
    ...(env.POLAR_SUCCESS_URL ? { successUrl: env.POLAR_SUCCESS_URL } : {}),
  })
  ctx.res.redirect(checkoutSession.url)
})

app.get('/portal', async (ctx, next) => {
  const email = new URL(ctx.request.url).searchParams.get('email')
  if (!email) {
    ctx.res.status = 400
    ctx.res.body = 'Missing email parameter'
  }
  const customer = await polar.customers.list({ email })
  if (!customer.result.items.length) {
    ctx.res.status = 404
    ctx.res.body = 'Customer not found'
  }
  const session = await polar.customerSessions.create({
    customerId: customer.result.items[0].id,
  })
  ctx.res.redirect(session.customerPortalUrl)
})

app.listen(env.PORT)

export default app
