import ClientProductList from '@/components/ClientProductList'
import Footer from '@/components/Footer'
import env from '@/lib/env'
import { ModProduct } from '@/lib/types'
import { Polar } from '@polar-sh/sdk'

export default async function Home() {
  async function getProducts() {
    const polar = new Polar({ accessToken: env.POLAR_ACCESS_TOKEN })
    const orgResult = await polar.organizations.get({ id: env.POLAR_ORG_ID })
    const result = await polar.products.list({
      limit: 100,
      isArchived: false,
      organizationId: env.POLAR_ORG_ID,
    })
    const products: ModProduct[] = []
    for await (const page of result) {
      page.result.items.forEach((it) => {
        products.push(it)
      })
    }
    await Promise.all(
      products.map(async (product, idx) => {
        const checkoutLink = await polar.checkoutLinks.list({
          limit: 1,
          productId: product.id,
          organizationId: env.POLAR_ORG_ID,
        })
        if (checkoutLink.result?.items?.[0]?.url) products[idx].checkoutLink = checkoutLink.result.items[0].url
      }),
    )
    return { products, orgResult }
  }
  const { products, orgResult } = await getProducts()
  return (
    <div className="flex flex-grow flex-col">
      <div className="flex w-full flex-col dark:bg-polar-900 bg-gray-50">
        <div className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-y-12 px-4 py-12 lg:px-0">
          <div className="flex flex-row items-center gap-x-4">
            <div className="dark:bg-polar-900 dark:border-polar-700 relative z-[2] flex flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50 text-sm h-10 w-10">
              <img loading="eager" alt={orgResult.name} src={orgResult.avatarUrl || ''} className="z-[1] aspect-square rounded-full object-cover opacity-100" />
            </div>
            <h3 className="text-lg">{orgResult.name}</h3>
          </div>
        </div>
      </div>
      <ClientProductList products={products} />
      <div className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-y-12 px-4 py-12 lg:px-0">
        <Footer />
      </div>
    </div>
  )
}
