import { getPolarClient } from '../utils/polar'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const polar = getPolarClient()
  const config = useRuntimeConfig()

  const successUrl = config.polarSuccessUrl

  const checkout = await polar.checkouts.create({
    products: [query.products as string],
    successUrl: successUrl as string,
    customerEmail: query.customerEmail as string | undefined,
  })

  return sendRedirect(event, checkout.url)
})

