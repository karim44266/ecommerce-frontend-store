'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '@/components/store/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getProducts, CATEGORIES, type Product } from '@/lib/api'

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? '')

  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''

  useEffect(() => {
    let cancelled = false
    getProducts({ search: search || undefined, category: category || undefined })
      .then((data) => { if (!cancelled) setProducts(data) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [search, category])

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchInput.trim()) params.set('search', searchInput.trim())
    if (activeCategory) params.set('category', activeCategory)
    router.push(`/products${params.size ? `?${params}` : ''}`)
  }

  const setCategory = (cat: string) => {
    const next = cat === activeCategory ? '' : cat
    setActiveCategory(next)
    const params = new URLSearchParams()
    if (searchInput.trim()) params.set('search', searchInput.trim())
    if (next) params.set('category', next)
    router.push(`/products${params.size ? `?${params}` : ''}`)
  }

  const clearFilters = () => {
    setSearchInput('')
    setActiveCategory('')
    router.push('/products')
  }

  const hasFilters = !!search || !!category

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {category ? category : 'All Products'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={applySearch} className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </form>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="self-start gap-1 text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategory('')}>
          <Badge
            variant={!activeCategory ? 'default' : 'outline'}
            className="px-4 py-1.5 text-sm cursor-pointer"
          >
            All
          </Badge>
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}>
            <Badge
              variant={activeCategory === cat ? 'default' : 'outline'}
              className="px-4 py-1.5 text-sm cursor-pointer"
            >
              {cat}
            </Badge>
          </button>
        ))}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <p className="text-4xl">🔍</p>
          <h2 className="text-xl font-semibold text-foreground">No products found</h2>
          <p className="text-muted-foreground">Try a different search term or category.</p>
          <Button onClick={clearFilters}>Browse all products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
