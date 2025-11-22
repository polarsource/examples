import '@dotenvx/dotenvx/config'
import { Polar } from '@polar-sh/sdk'
import crypto from 'crypto'
import http from 'http'
import { z } from 'zod'

const envSchema = z.object({
  POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  POLAR_SUCCESS_URL: z.string().url('POLAR_SUCCESS_URL must be a valid URL').optional(),
})

const env = envSchema.parse(process.env)

const polar = new Polar({ accessToken: env.POLAR_ACCESS_TOKEN, server: env.POLAR_MODE })

// Helper function to parse request body
const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      resolve(body)
    })
    req.on('error', reject)
  })
}

// Helper function to verify webhook signature
const verifyWebhookSignature = (payload, signature, secret) => {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const digest = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

const app = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname
  const method = req.method

  try {
    // Route: GET /
    if (pathname === '/' && method === 'GET') {
      const products = await polar.products.list({
        isArchived: false
      })
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(
        `<html><body>
        <form action="/portal" method="get">
          <input type="email" name="email" placeholder="Email" required />
          <button type="submit">Open Customer Portal</button>
        </form>
        ${products.result.items.map(product => `<div><a target="_blank" href="/checkout?products=${product.id}">${product.name}</a></div>`).join('')}
        </body></html>`
      )
      return
    }

    // Route: POST /polar/webhooks
    if (pathname === '/polar/webhooks' && method === 'POST') {
      const body = await getRequestBody(req)
      const signature = req.headers['webhook-signature'] || req.headers['x-polar-webhook-signature']

      if (!signature) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Missing webhook signature' }))
        return
      }

      if (!verifyWebhookSignature(body, signature, env.POLAR_WEBHOOK_SECRET)) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Invalid webhook signature' }))
        return
      }

      const payload = JSON.parse(body)
      console.log(payload)

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ received: true }))
      return
    }

    // Route: GET /checkout
    if (pathname === '/checkout' && method === 'GET') {
      const productIds = url.searchParams.get('products')

      if (!productIds) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Missing products parameter' }))
        return
      }

      const checkoutSession = await polar.checkouts.create({
        products: typeof productIds === 'string' ? [productIds] : productIds,
        successUrl: env.POLAR_SUCCESS_URL || `http://${req.headers.host}/`,
      })

      res.writeHead(302, { 'Location': checkoutSession.url })
      res.end()
      return
    }

    // Route: GET /portal
    if (pathname === '/portal' && method === 'GET') {
      const email = url.searchParams.get('email')

      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Missing email parameter' }))
        return
      }

      const customer = await polar.customers.list({ email })

      if (!customer.result.items.length) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Customer not found' }))
        return
      }

      const session = await polar.customerSessions.create({
        customerId: customer.result.items[0].id
      })

      res.writeHead(302, { 'Location': session.customerPortalUrl })
      res.end()
      return
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))

  } catch (error) {
    console.error('Error:', error)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: error.message }))
  }
})

app.listen(3000)

export default app
