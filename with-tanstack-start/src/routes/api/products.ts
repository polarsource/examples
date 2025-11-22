import { polar } from '../polar'
import { createServerFn } from '@tanstack/react-start'

export const products = createServerFn().handler(async () => {
  const res = await polar.products.list({ isArchived: false })
  return res.result?.items ?? []
})
