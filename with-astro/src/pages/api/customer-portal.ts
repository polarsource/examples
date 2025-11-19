import { polar } from '@/lib/polar'
import { CustomerPortal } from '@polar-sh/astro'
import { POLAR_ACCESS_TOKEN, POLAR_MODE } from 'astro:env/server'

if (!POLAR_ACCESS_TOKEN) throw new Error('Missing POLAR_ACCESS_TOKEN environment variable')

export const GET = CustomerPortal({
  accessToken: POLAR_ACCESS_TOKEN,
  server: POLAR_MODE as 'sandbox' | 'production',
  getCustomerId: async (request) => {
    // Get customer ID or email from URL search params
    const url = new URL(request.url)
    const customerEmail = url.searchParams.get('customerEmail')
    // Look up customer by email
    // If no customer ID found, return null or throw error
    if (!customerEmail) throw new Error('Customer ID not found. Please provide customerId or customerEmail parameter.')
    const customers = await polar.customers.list({ email: customerEmail })
    if (customers.result.items.length > 0) return customers.result.items[0].id
    throw new Error('Customer ID not found. Please provide customerId or customerEmail parameter.')
  },
})
