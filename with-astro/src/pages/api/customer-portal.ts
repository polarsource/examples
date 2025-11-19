import { CustomerPortal } from '@polar-sh/astro'
import { POLAR_MODE, POLAR_OAT } from 'astro:env/server'
type PolarMode = 'sandbox' | 'production' | undefined

if (!POLAR_OAT) {
  throw new Error('Missing POLAR_ACCESS_TOKEN environment variable')
}

export const GET = CustomerPortal({
  accessToken: POLAR_OAT,
  getCustomerId: async (request) => {
    // Get customer ID or email from URL search params
    const url = new URL(request.url)
    const customerIdFromParams = url.searchParams.get('customerId')
    const customerEmail = url.searchParams.get('customerEmail')

    console.log('Request params:', { customerIdFromParams, customerEmail })

    if (customerIdFromParams) {
      return customerIdFromParams
    }

    // Look up customer by email
    if (customerEmail) {
      try {
        const { polarClient } = await import('../../lib/polarClient')
        console.log('Looking up customer with email:', customerEmail)

        const customers = await polarClient.customers.list({
          email: customerEmail,
        })

        if (customers.result.items.length > 0) {
          const customerId = customers.result.items[0].id
          console.log('Found customer ID:', customerId)
          return customerId
        } else {
          // Customer doesn't exist, create one
          const newCustomer = await polarClient.customers.create({
            email: customerEmail,
          })
          return newCustomer.id
        }
      } catch (error) {
        console.error('Error fetching/creating customer by email:', error)
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error message:', error.message)
          console.error('Error stack:', error.stack)
        }
        throw new Error(`Failed to get customer: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // If no customer ID found, return null or throw error
    throw new Error('Customer ID not found. Please provide customerId or customerEmail parameter.')
  },
  server: POLAR_MODE as PolarMode,
})
