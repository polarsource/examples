'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowDown, ArrowUp, SearchIcon } from 'lucide-react'

interface SearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void
}

export default function Search({ searchQuery, onSearchChange, sortOrder, onSortOrderChange }: SearchProps) {
  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-row gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search products..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Sort by name:</span>
        <Button variant="outline" size="icon" onClick={toggleSortOrder} className="h-10 w-10">
          {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
