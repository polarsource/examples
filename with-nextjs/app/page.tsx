'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Page() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/products')
      .then((res) => res.json())
      .then((res) => setProducts(res))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      {/* <Link target='_blank' href={`/api/customer-portal?email=${email}`}>Open Customer Portal</Link> */}
      {loading ? (
        <div className="mt-8 text-gray-500 dark:text-gray-400 text-center">Loading...</div>
      ) : products.length > 0 ? (
        <div className="w-full max-w-2xl mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Products</h2>
          <ul className="space-y-4">
            {products.map((p: any) => {
              return (
                <li key={p.id} className="bg-white dark:bg-gray-800 rounded border p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{p.name}</h3>
                  </div>
                  <Link target="_blank" href={`/api/checkout?products=${p.id}`} className="border px-2 py-1 rounded">
                    Open Checkout
                  </Link>
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
