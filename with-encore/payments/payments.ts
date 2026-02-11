import { api } from 'encore.dev/api'
import { Webhook } from 'standardwebhooks'
import { polar, POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET } from './polar'

// Home route - list products
export const home = api.raw({ expose: true, path: '/', method: 'GET' }, async (req, resp) => {
  const products = await polar.products.list({ isArchived: false })
  resp.writeHead(200, { 'Content-Type': 'text/html' })
  resp.end(`<html><body>
    <form action="/portal" method="get">
      <input type="email" name="email" placeholder="Email" required />
      <button type="submit">Open Customer Portal</button>
    </form>
    ${products.result.items.map((product) => `<div><a target="_blank" href="/checkout?products=${product.id}">${product.name}</a></div>`).join('')}
  </body></html>`)
})

// Checkout route - create a checkout session and redirect
export const checkout = api.raw({ expose: true, path: '/checkout', method: 'GET' }, async (req, resp) => {
  const url = new URL(req.url!, `http://${req.headers.host}`)
  const productIds = url.searchParams.get('products')

  if (!productIds) {
    resp.writeHead(400)
    resp.end('Missing products parameter')
    return
  }

  const checkoutSession = await polar.checkouts.create({
    products: typeof productIds === 'string' ? [productIds] : productIds,
    successUrl: `http://${req.headers.host}/`,
  })

  resp.writeHead(302, { Location: checkoutSession.url })
  resp.end()
})

// Customer portal route - redirect to Polar customer portal
export const portal = api.raw({ expose: true, path: '/portal', method: 'GET' }, async (req, resp) => {
  const url = new URL(req.url!, `http://${req.headers.host}`)
  const email = url.searchParams.get('email')

  if (!email) {
    resp.writeHead(400)
    resp.end('Missing email parameter')
    return
  }

  const customer = await polar.customers.list({ email })

  if (!customer.result.items.length) {
    resp.writeHead(404)
    resp.end('Customer not found')
    return
  }

  const session = await polar.customerSessions.create({
    customerId: customer.result.items[0].id,
  })

  resp.writeHead(302, { Location: session.customerPortalUrl })
  resp.end()
})

// Webhook route - verify and handle Polar webhook events
export const webhooks = api.raw({ expose: true, path: '/polar/webhooks', method: 'POST' }, async (req, resp) => {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const body = Buffer.concat(chunks).toString('utf-8')

  const headers: Record<string, string> = {}
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key] = Array.isArray(value) ? value[0] : (value || '')
  }

  try {
    const base64Secret = Buffer.from(POLAR_WEBHOOK_SECRET().trim(), 'utf-8').toString('base64')
    const wh = new Webhook(base64Secret)
    const payload = wh.verify(body, headers) as any

    console.log(`[Polar] Received event: ${payload.type}`, payload.data.id)

    resp.writeHead(200, { 'Content-Type': 'application/json' })
    resp.end(JSON.stringify({ received: true }))
  } catch (error: any) {
    console.error('[Polar] Invalid webhook signature:', error?.message)
    resp.writeHead(403)
    resp.end(JSON.stringify({ error: 'Invalid signature' }))
  }
})
