import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { products } from './api/products'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ms from 'ms'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  const fetchProducts = useServerFn(products)

  const query = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
    staleTime: ms('24h'),
  })

  if (query.isLoading) return <div className="flex p-4 justify-center text-3xl items-center h-screen">Loading...</div>

  if (query.error) return <div className="flex p-4 justify-center text-red-500 items-center h-screen">Error loading products</div>

  return (
    <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
      {query.data?.map((product: any) => {
        const firstMedia = product.medias?.[0]
        const firstPrice = product.prices?.[0]

        const image = firstMedia?.publicUrl ?? null

        const amount = typeof firstPrice?.priceAmount === 'number' ? firstPrice.priceAmount / 100 : null

        const currency = firstPrice?.priceCurrency ? String(firstPrice.priceCurrency).toUpperCase() : 'USD'

        const checkoutHref = `/api/checkout?products=${encodeURIComponent(product.id)}`

        return (
          <Card key={product.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              {product.description && <CardDescription>{product.description}</CardDescription>}
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {image && <img src={image} alt={product.name} className="rounded-lg object-cover h-48 w-full" />}

              {amount != null ? (
                <p className="text-sm font-medium">
                  {amount} <span className="font-bold">{currency}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No pricing available</p>
              )}
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild className="w-full" disabled={!firstPrice}>
                <Link to={checkoutHref} reloadDocument>
                  {firstPrice ? 'Buy now' : 'Unavailable'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
