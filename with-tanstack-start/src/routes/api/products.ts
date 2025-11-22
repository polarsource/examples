// src/routes/api/products.ts
import { createServerFn } from '@tanstack/react-start'
import { getPolarClient } from '@/routes/polarClient'

export const products = createServerFn().handler(async () => {
  const polar = getPolarClient()
  const res = await polar.products.list({ isArchived: false })
  return res.result?.items ?? []
})
