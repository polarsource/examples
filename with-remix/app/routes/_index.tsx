import { useLoaderData } from 'react-router'
import type { LoaderFunctionArgs } from 'react-router'
import { getPolarClient } from '~/polar.server'
import { ProductsGrid } from '~/components/ProductsGrid'

export async function loader({}: LoaderFunctionArgs) {
  const polar = getPolarClient()
  const res = await polar.products.list({ isArchived: false })
  return res?.result?.items ?? []
}

export default function Index() {
  const products = useLoaderData<typeof loader>()
  return <ProductsGrid products={products} />
}
