import { Webhooks } from '@polar-sh/astro'
import { POLAR_WEBHOOK_SECRET } from 'astro:env/server'

export const POST = Webhooks({
  webhookSecret: POLAR_WEBHOOK_SECRET,

  // Catch-all handler for any other events
  onPayload: async (payload) => {
    // Handle the payload
    console.log('Payload received:', payload.type)
  },

  // add more granular event handlers such as
  onCheckoutCreated: async (payload) => {
    console.log('Checkout created:', payload)
  },

  onOrderCreated: async (payload) => {
    console.log('Order created:', payload)
  },

  onOrderPaid: async (payload) => {
    console.log('Order paid:', payload)
  },
})
