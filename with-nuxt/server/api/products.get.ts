import { getPolarClient } from '../utils/polar'

export default defineEventHandler(async (event) => {
  const polar = getPolarClient()
  const products = await polar.products.list({ isArchived: false })
  return products?.result?.items ?? []
})
