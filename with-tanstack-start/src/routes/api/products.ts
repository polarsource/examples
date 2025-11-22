// src/routes/api/products.ts
import { createServerFn } from '@tanstack/react-start'
import { polar } from '../polar'
export const products = createServerFn().handler(async () => {
  const res = await polar.products.list({ isArchived: false })
  return res.result?.items ?? []
})
