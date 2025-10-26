import { polarClient } from './polarClient'

export async function getProducts() {
  const products = await polarClient.products.list({ isArchived: false })
  return products?.result?.items ?? []
}
