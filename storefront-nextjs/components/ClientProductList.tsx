'use client'

import { ModProduct } from '@/lib/types'
import { useMemo, useState } from 'react'
import Product from './Product'
import Search from './Search'

interface ClientProductListProps {
  products: ModProduct[]
}

export default function ClientProductList({ products }: ClientProductListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const searchLower = searchQuery.toLowerCase()
      // Search in multiple fields
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description && product.description.toLowerCase().includes(searchLower)) ||
        (product.id && product.id.toLowerCase().includes(searchLower))
      )
    })

    // Sort products
    filtered.sort((a, b) => {
      const aValue = a.name.toLowerCase()
      const bValue = b.name.toLowerCase()
      if (sortOrder === 'asc') return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      else return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    })

    return filtered
  }, [products, searchQuery, sortOrder])

  return (
    <div className="flex w-full flex-col md:mx-auto md:max-w-5xl pt-12">
      <div className="px-4 lg:px-0 mb-6">
        <Search searchQuery={searchQuery} onSearchChange={setSearchQuery} sortOrder={sortOrder} onSortOrderChange={setSortOrder} />
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-500">
            Found {filteredAndSortedProducts.length} of {products.length} products
          </div>
        )}
      </div>
      <div className="flex w-full flex-col items-stretch gap-6 px-4 md:flex-row md:gap-12 lg:px-0">
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:py-12 gap-4">
          {filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((product) => <Product key={product.id} {...product} />)
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              {searchQuery ? (
                <div>
                  <p className="text-lg font-medium mb-2">No products found</p>
                  <p className="text-sm">Try adjusting your search terms or filters.</p>
                </div>
              ) : (
                <p>No products available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
