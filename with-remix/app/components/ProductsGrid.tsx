import { ProductCard } from '~/components/ProductCard'

type Product = {
  id: string
  name: string
  description?: string | null
  medias?: { publicUrl: string }[]
  prices?: { priceAmount?: number; priceCurrency?: string }[]
}

export function ProductsGrid({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-500">No products available.</p>
      </div>
    )
  }

  return (
    <section id="products" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-medium text-center mb-12">Products</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const firstMedia = product.medias?.[0]
            const firstPrice = product.prices?.[0]

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                image={firstMedia?.publicUrl ?? null}
                priceAmount={firstPrice?.priceAmount ?? undefined}
                priceCurrency={firstPrice?.priceCurrency ?? 'USD'}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
