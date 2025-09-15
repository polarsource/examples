'use client'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [customerPortalUrl, setCustomerPortalUrl] = useState<string | undefined>()
  const router = useRouter()

  async function fetchProducts() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/products')

      if (!response.ok) {
        throw new Error('Server responded with an error.')
      }

      const productData = await response.json()
      setProducts(productData)
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
      const storedCustomerPortalUrl = localStorage.getItem('customerPortalUrl')
      // Ensure the stored value isn't '[object Object]'
      if (storedCustomerPortalUrl && storedCustomerPortalUrl !== '[object Object]') {
        setCustomerPortalUrl(storedCustomerPortalUrl)
      }
    }
  }, [])

  async function fetchCustomerPortal() {
    try {
      const email = prompt('Please Enter your email.')
      if (!email) return
      const response = await fetch(`/api/customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        const portalUrl = data?.customerPortalUrl
        if (portalUrl && typeof portalUrl === 'string') {
          setCustomerPortalUrl(portalUrl)

          if (typeof window !== 'undefined') {
            if (data?.customerId) {
              localStorage.setItem('customerId', data.customerId)
            }
            localStorage.setItem('customerPortalUrl', portalUrl)
          }

          router.replace(portalUrl)
        } else {
          console.error('Received invalid customer portal URL from API:', portalUrl)
          alert('An unexpected error occurred: Could not retrieve a valid customer portal URL.')
        }
      } else {
        const errorMessage = data.message || 'An unexpected error occurred.'
        const issues = data.issues?.map((issue: any) => issue.message).join(', ')
        alert(`Error: ${errorMessage}${issues ? ` (${issues})` : ''}`)
      }
    } catch (error) {
      console.error('Error in Creating Customer Portal', error)
      alert('An unexpected error occurred while creating the customer portal.')
    }
  }

  async function buyToken(productId: string) {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })
      const data = await response.json()

      if (response.ok) {
        router.replace(data?.checkoutUrl)
      } else {
        const errorMessage = data.message || 'An unexpected error occurred.'
        const issues = data.issues?.map((issue: any) => issue.message).join(', ')
        alert(`Error: ${errorMessage}${issues ? ` (${issues})` : ''}`)
      }
    } catch (error) {
      console.error('Error in buying Token', error)
      alert('An unexpected error occurred while trying to buy a token.')
    }
  }

  const items = Array.isArray(products) ? products : []

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 dark:from-gray-900 dark:via-black dark:to-pink-950/40 text-gray-800 dark:text-gray-200">
      <div className="flex flex-col items-center justify-center p-6 pt-12">
        <div className="flex items-center gap-4 text-pink-500">
          <Image src="/polar.svg" alt="Polar Logo" width={80} height={80} />
        </div>
        <h1 className="text-5xl font-extrabold mt-4 text-center text-gray-900 dark:text-white">
          Get Your Tokens
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 text-center max-w-2xl">
          The simplest way to purchase tokens and manage your billing.
        </p>
        <div className="mt-8">
          {customerPortalUrl ? (
            <Button size="lg" onClick={() => router.replace(customerPortalUrl)}>
              Go to Customer Portal
            </Button>
          ) : (
            <Button size="lg" onClick={fetchCustomerPortal}>
              Create Customer Portal
            </Button>
          )}
        </div>

        <div className="w-full max-w-5xl mt-16">
          {loading ? (
            <div className="text-center text-gray-500 dark:text-gray-400">Loading products...</div>
          ) : error ? (
            <div className="text-center text-red-500 dark:text-red-400">{error}</div>
          ) : items.length > 0 ? (
            <div className="space-y-8">
              {items.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white/60 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-lg p-6 grid md:grid-cols-2 gap-6 items-center"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{p.name}</h3>
                  </div>
                  <div className="text-center md:text-right">
                    <Button onClick={() => buyToken(p.id)} size="lg">
                      Buy Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">No products found.</div>
          )}
        </div>
      </div>
    </main>
  )
}

