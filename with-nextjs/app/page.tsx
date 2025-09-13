'use client'
import { Button } from '@/components/ui/button'
import { polar } from './polar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [customerPortalUrl, setCustomerPortalUrl] = useState()
  const router = useRouter()

  async function fetchProducts() {
    setLoading(true)
    setError(null)
    try {
      const product = await polar.products.list({ isArchived: false })
      setProducts(product?.result?.items ?? [])
    } catch (e: any) {
      setError('Failed to fetch products.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    if (typeof window !== 'undefined') {
      const storedCustomerPortalUrl: any = localStorage.getItem('customerPortalUrl')

      if (storedCustomerPortalUrl) {
        setCustomerPortalUrl(storedCustomerPortalUrl)
      }
    }
  }, [])

  async function fetchCustomerPortal() {
    try {
      const email = prompt('Please Enter your email.')
      const response = await fetch(`/api/customer-portal?email=${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const data = await response.json()

        setCustomerPortalUrl(data?.customerPortalUrl)

        // Store customerId and customerPortalUrl in localStorage for localhost
        if (typeof window !== 'undefined') {
          if (data?.customerId) {
            localStorage.setItem('customerId', data.customerId)
          }
          if (data?.customerPortalUrl) {
            localStorage.setItem('customerPortalUrl', data.customerPortalUrl)
          }
        }
        router.replace(data?.customerPortalUrl)
      }
    } catch (error) {
      console.log('Error in Creating Customer Portal', error)
    }
  }
  // Defensive: fallback to empty array if products is undefined
  const items = Array.isArray(products) ? products : []

  async function buyToken(productId: string) {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (response.ok) {
        const data = await response.json()
        router.replace(data?.checkoutUrl)
      }
    } catch (error) {
      console.log('Error in buying Token', error)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div>
        <svg width="100" height="100" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_1_4)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M66.4284 274.26C134.876 320.593 227.925 302.666 274.258 234.219C320.593 165.771 302.666 72.7222 234.218 26.3885C165.77 -19.9451 72.721 -2.0181 26.3873 66.4297C-19.9465 134.877 -2.01938 227.927 66.4284 274.26ZM47.9555 116.67C30.8375 169.263 36.5445 221.893 59.2454 256.373C18.0412 217.361 7.27564 150.307 36.9437 92.318C55.9152 55.2362 87.5665 29.3937 122.5 18.3483C90.5911 36.7105 62.5549 71.8144 47.9555 116.67ZM175.347 283.137C211.377 272.606 244.211 246.385 263.685 208.322C293.101 150.825 282.768 84.4172 242.427 45.2673C264.22 79.7626 269.473 131.542 252.631 183.287C237.615 229.421 208.385 265.239 175.347 283.137ZM183.627 266.229C207.945 245.418 228.016 210.604 236.936 168.79C251.033 102.693 232.551 41.1978 195.112 20.6768C214.97 47.3945 225.022 99.2902 218.824 157.333C214.085 201.724 200.814 240.593 183.627 266.229ZM63.7178 131.844C49.5155 198.43 68.377 260.345 106.374 280.405C85.9962 254.009 75.5969 201.514 81.8758 142.711C86.5375 99.0536 99.4504 60.737 116.225 35.0969C92.2678 55.983 72.5384 90.4892 63.7178 131.844ZM199.834 149.561C200.908 217.473 179.59 272.878 152.222 273.309C124.853 273.742 101.797 219.039 100.724 151.127C99.6511 83.2138 120.968 27.8094 148.337 27.377C175.705 26.9446 198.762 81.648 199.834 149.561Z"
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="clip0_1_4">
              <rect width="300" height="300" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div>
        {customerPortalUrl ? (
          <Button onClick={() => router.replace(customerPortalUrl)}>Open Customer Portal</Button>
        ) : (
          <Button onClick={fetchCustomerPortal}>Create Customer Portal</Button>
        )}
      </div>
      {loading ? (
        <div className="mt-8 text-gray-500 dark:text-gray-400 text-center">Loading products...</div>
      ) : error ? (
        <div className="mt-8 text-red-500 dark:text-red-400 text-center">{error}</div>
      ) : items.length > 0 ? (
        <div className="w-full max-w-2xl mt-8">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Buy Products</h2>
          <ul className="space-y-4">
            {items.map((p: any) => {
              return (
                <li key={p.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
                  </div>
                  <Button onClick={() => buyToken(p.id)}>Buy Token</Button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-8 text-gray-500 dark:text-gray-400 text-center">No products found.</div>
      )}
    </main>
  )
}
