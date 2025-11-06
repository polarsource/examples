import { Form, useLocation } from 'react-router-dom'
import { CustomerPortal } from '@polar-sh/remix'
import { getPolarClient } from '~/polar.server'

export const loader = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_MODE as 'sandbox' | 'production') ?? 'sandbox',
  getCustomerId: async (req: Request) => {
    const url = new URL(req.url)
    const email = url.searchParams.get('customerEmail')

    if (!email) return ''

    const polar = getPolarClient()
    const list = await polar.customers.list({ email })

    if (list?.result?.items?.length) {
      return list.result.items[0].id
    }

    const customer = await polar.customers.create({ email })
    return customer.id
  },
  returnUrl: process.env.POLAR_RETURN_URL,
})

export default function CustomerPortalPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const email = searchParams.get('customerEmail')

  if (!email) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Your Portal</h1>
        <Form method="get" className="space-y-4">
          <input type="email" name="customerEmail" placeholder="Enter your email" className="border rounded-md px-4 py-2 w-full" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md w-full">
            View Portal
          </button>
        </Form>
      </div>
    )
  }

  return null
}
