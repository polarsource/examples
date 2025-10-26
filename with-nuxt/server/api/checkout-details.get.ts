import { getPolarClient } from '../utils/polar'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const checkoutId = query.checkoutId as string

  if (!checkoutId) {
    return { checkout: null, product: null }
  }

  try {
    const polar = getPolarClient()
    const checkout = await polar.checkouts.get({ id: checkoutId })
    let product = null
    if (checkout.productId) {
      product = await polar.products.get({ id: checkout.productId })
    }
    return { checkout, product }
  } catch (error) {
    console.error('Failed to fetch checkout details:', error)
    return { checkout: null, product: null }
  }
})
