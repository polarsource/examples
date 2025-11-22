import { z } from 'zod';
import '@dotenvx/dotenvx/config';
import { Polar } from '@polar-sh/sdk';
import { Webhook } from "standardwebhooks";

const envSchema = z.object({
  POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  POLAR_SUCCESS_URL: z.string().url('POLAR_SUCCESS_URL must be a valid URL').optional(),
})

const env = envSchema.parse(process.env)

const polar = new Polar({ accessToken: env.POLAR_ACCESS_TOKEN, server: env.POLAR_MODE })

export default {
  async fetch(req) {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const { pathname, method } = url
    try {
      // Route: GET /
      if (pathname === '/' && method === 'GET') {
        const products = await polar.products.list({ isArchived: false })
        return new Response(
          `<html><body>
        <form action="/portal" method="get">
          <input type="email" name="email" placeholder="Email" required />
          <button type="submit">Open Customer Portal</button>
        </form>
        ${products.result.items.map(product => `<div><a target="_blank" href="/checkout?products=${product.id}">${product.name}</a></div>`).join('')}
        </body></html>`,
          {
            headers: {
              'Content-Type': 'text/html',
            },
          }
        )
      }
      // Route: POST /polar/webhooks
      if (pathname === '/polar/webhooks' && method === 'POST') {
        const requestBody = await req.text()
        const webhookHeaders = {
          "webhook-id": req.headers.get("webhook-id"),
          "webhook-timestamp": req.headers.get("webhook-timestamp"),
          "webhook-signature": req.headers.get("webhook-signature"),
        };
        const base64Secret = Buffer.from(env.POLAR_WEBHOOK_SECRET, "utf-8").toString("base64");
        const webhook = new Webhook(base64Secret);
        try {
          webhook.verify(requestBody, webhookHeaders);
        } catch (error) {
          console.log(error.message || error.toString())
        }
        console.log(JSON.parse(requestBody))
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
      // Route: GET /checkout
      if (pathname === '/checkout' && method === 'GET') {
      const productIds = url.searchParams.get('products')
      if (!productIds) {
        return new Response(JSON.stringify({ error: 'Missing products parameter' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
      const checkoutSession = await polar.checkouts.create({
        products: typeof productIds === 'string' ? [productIds] : productIds,
        successUrl: env.POLAR_SUCCESS_URL || `http://${req.headers.host}/`,
      })
      return new Response(JSON.stringify({ url: checkoutSession.url }), {
        status: 302,
        headers: {
          'Location': checkoutSession.url,
        },
      })
    }
    // Route: GET /portal
    if (pathname === '/portal' && method === 'GET') {
      const email = url.searchParams.get('email')
      if (!email) {
        return new Response(JSON.stringify({ error: 'Missing email parameter' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
      const customer = await polar.customers.list({ email })
      if (!customer.result.items.length) {
        return new Response(JSON.stringify({ error: 'Customer not found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
      const session = await polar.customerSessions.create({
        customerId: customer.result.items[0].id
      })
      return new Response(JSON.stringify({ url: session.customerPortalUrl }), {
        status: 302,
        headers: {
          'Location': session.customerPortalUrl,
        },
      })
    }
    // 404 Not Found
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch(error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
},
}
