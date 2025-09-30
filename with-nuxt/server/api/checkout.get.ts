import { getPolarClient } from '../utils/polar'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const polar = getPolarClient()
  const config = useRuntimeConfig()
  const isSandbox = config.mode === 'sandbox'

  const successUrl = isSandbox ? config.public.sandboxPolarSuccessUrl : config.public.polarSuccessUrl

  const checkout = await polar.checkouts.create({
    products: [query.products as string],
    successUrl: successUrl as string,
    customerEmail: query.customerEmail as string | undefined,
  })

  return sendRedirect(event, checkout.url)
})
