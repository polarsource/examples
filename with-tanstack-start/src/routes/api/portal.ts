import { env } from '@/config/env'
import { CustomerPortal } from '@polar-sh/tanstack-start'
import { createFileRoute } from '@tanstack/react-router'
import { getPolarClient } from '../polarClient'
import { z } from 'zod'

const searchSchema = z.object({
  email: z.string(),
})
export const Route = createFileRoute('/api/portal')({
  validateSearch: (s) => searchSchema.parse(s),
  server: {
    handlers: {
      GET: CustomerPortal({
        accessToken: env.POLAR_ACCESS_TOKEN,
        getCustomerId: async (req: Request) => {
          const url = new URL(req.url)
          const email = url.searchParams.get('email') ?? ''

          if (!email) return ''

          const polar = getPolarClient()
          const list = await polar.customers.list({ email })

          if (list?.result?.items?.length) {
            return list.result.items[0].id
          }

          const customer = await polar.customers.create({ email })
          return customer.id
        },
        returnUrl: 'http://localhost:3000',
        server: env.POLAR_MODE,
      }),
    },
  },
})
