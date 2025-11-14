import { polarClient } from './polarClient'
import { type Product } from '@polar-sh/sdk/models/components/product.js' 


export async function getProducts(): Promise<Product[]> {
  const products = await polarClient.products.list({ isArchived: false })
  return products?.result?.items ?? []
}
