import { useLoaderData } from 'react-router'
import type { LoaderFunctionArgs } from 'react-router'
import { getPolarClient } from '~/polar.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const checkoutId = url.searchParams.get('checkoutId')

  if (!checkoutId) {
    return { checkout: null, product: null }
  }

  try {
    const polar = getPolarClient()
    const checkout = await polar.checkouts.get({ id: checkoutId })
    let product = null
    if ((checkout as any).productId) {
      product = await polar.products.get({ id: (checkout as any).productId })
    }
    return { checkout, product }
  } catch (error) {
    console.error('Failed to fetch checkout details:', error)
    return { checkout: null, product: null }
  }
}

export default function SuccessPage() {
  const { checkout, product } = useLoaderData<typeof loader>()

  if (!checkout || !product) {
    return (
      <div className="container mx-auto px-4 text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Invalid Session</h1>
        <p className="text-gray-500 mb-6">We couldn't find your purchase details.</p>
      </div>
    )
  }

  return (
    <section className="pt-4 pb-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-green-600 mb-4">Purchase Successful 🎉</h1>

          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase! You now have access to <b>{product.name}</b>.
          </p>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{product.description}</p>
            <p className="font-medium">Order ID: {(checkout as any).id}</p>
          </div>

          <p className="text-gray-500 mb-4">You’ll also receive an email confirmation shortly.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/polar/customer-portal" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Go to Customer Portal
            </a>
            <a
              href="/"
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Products
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
