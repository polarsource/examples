import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { Polar } from '@polar-sh/sdk'
import { Checkout, CustomerPortal, Webhooks } from "@polar-sh/hono";

const app = new Hono()

app.post('/polar/webhooks', async (c) => {
  const { POLAR_WEBHOOK_SECRET } = env<{ POLAR_WEBHOOK_SECRET: string }>(c)
  return await Webhooks({
    webhookSecret: POLAR_WEBHOOK_SECRET,
    onPayload: async (payload) => {
      return c.json(payload)
    }
  })(c)
})

app.get(
  "/checkout",
  async (c) => {
    const { POLAR_MODE, POLAR_ACCESS_TOKEN } = env<{ POLAR_MODE: string; POLAR_ACCESS_TOKEN: string; }>(c)
    return await Checkout({
      accessToken: POLAR_ACCESS_TOKEN,
      server: POLAR_MODE === "production" ? "production" : "sandbox",
    })(c)
  }
);

app.get(
  "/portal",
  async (c) => {
    const { email } = c.req.query()
    const { POLAR_MODE, POLAR_ACCESS_TOKEN } = env<{ POLAR_MODE: string; POLAR_ACCESS_TOKEN: string; }>(c)
    return await CustomerPortal({
      server: POLAR_MODE === "production" ? "production" : "sandbox",
      accessToken: POLAR_ACCESS_TOKEN,
      getCustomerId: async (event) => {
        const polar = new Polar({
          accessToken: POLAR_ACCESS_TOKEN,
          server: POLAR_MODE === "production" ? "production" : "sandbox",
        });
        const customer = await polar.customers.list({ email, limit: 1, page: 1 });
        return await customer.result.items[0].id
      },
    })(c)
  }
);

export default app
