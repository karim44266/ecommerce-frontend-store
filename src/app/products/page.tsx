'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { ProductCard } from '@/components/store/ProductCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getProductsPaginated,
  getCategories,
  type Product,
  type SimpleCategory,
  type SortBy,
  type SortOrder,
  type PaginatedResponse,
} from '@/lib/api'

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest first' },
  { value: 'createdAt-asc', label: 'Oldest first' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
  { value: 'name-desc', label: 'Name: Z → A' },
] as const

const PRODUCTS_PER_PAGE = 12

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [meta, setMeta] = useState<PaginatedResponse<Product>['meta'] | null>(null)
  const [categories, setCategories] = useState<SimpleCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') ?? '')

  const search = searchParams.get('search') ?? ''
  const category = searchParams.get('category') ?? ''
  const sortParam = searchParams.get('sort') ?? 'createdAt-desc'
  const page = Number(searchParams.get('page') ?? '1') || 1

  const [sortBy, sortOrder] = sortParam.split('-') as [SortBy, SortOrder]

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined> = {}) => {
      const params = new URLSearchParams()
      const s = overrides.search ?? searchInput.trim()
      const c = overrides.category ?? activeCategory
      const so = overrides.sort ?? sortParam
      const p = overrides.page ?? String(page)
      if (s) params.set('search', s)
      if (c) params.set('category', c)
      if (so && so !== 'createdAt-desc') params.set('sort', so)
      if (p && p !== '1') params.set('page', p)
      return `/products${params.size ? `?${params}` : ''}`
    },
    [searchInput, activeCategory, sortParam, page],
  )

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getProductsPaginated({
      search: search || undefined,
      category: category || undefined,
      sortBy,
      sortOrder,
      page,
      limit: PRODUCTS_PER_PAGE,
    })
      .then((res) => {
        if (cancelled) return
        setProducts(res.data)
        setMeta(res.meta)
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([])
          setMeta(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [search, category, sortBy, sortOrder, page])

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(buildUrl({ search: searchInput.trim(), page: '1' }))
  }

  const setCategory = (cat: string) => {
    const next = cat === activeCategory ? '' : cat
    setActiveCategory(next)
    router.push(buildUrl({ category: next, page: '1' }))
  }

  const onSortChange = (value: string) => {
    router.push(buildUrl({ sort: value, page: '1' }))
  }

  const goToPage = (p: number) => {
    router.push(buildUrl({ page: String(p) }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchInput('')
    setActiveCategory('')
    router.push('/products')
  }

  const hasFilters = !!search || !!category
  const totalPages = meta?.totalPages ?? 1
  const totalProducts = meta?.total ?? products.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground uppercase tracking-tight">
            {category || 'All Products'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading
              ? 'Loading…'
              : `${totalProducts} product${totalProducts !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sort</span>
          <Select value={sortParam} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search + filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form onSubmit={applySearch} className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tools, materials, brands..."
              className="pl-9 bg-muted/50"
            />
          </div>
          <Button type="submit" variant="outline" className="gap-1.5">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </form>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategory('')}>
          <Badge
            variant={!activeCategory ? 'default' : 'outline'}
            className="px-4 py-1.5 text-xs font-semibold cursor-pointer uppercase tracking-wide"
          >
            All
          </Badge>
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setCategory(cat.name)}>
            <Badge
              variant={activeCategory === cat.name ? 'default' : 'outline'}
              className="px-4 py-1.5 text-xs font-semibold cursor-pointer"
            >
              {cat.name}
            </Badge>
          </button>
        ))}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <LayoutGrid className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <h2 className="font-display text-xl font-bold text-foreground uppercase">No products found</h2>
          <p className="text-muted-foreground text-sm">
            Try a different search term or browse a department.
          </p>
          <Button onClick={clearFilters}>Browse All Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (p === 1 || p === totalPages) return true
                return Math.abs(p - page) <= 2
              })
              .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('dots')
                acc.push(p)
                return acc
              }, [])
              .map((item, idx) =>
                item === 'dots' ? (
                  <span key={`dots-${idx}`} className="px-2 text-muted-foreground text-sm">…</span>
                ) : (
                  <Button
                    key={item}
                    variant={item === page ? 'default' : 'outline'}
                    size="icon-xs"
                    onClick={() => goToPage(item)}
                    className="w-8 h-8 text-sm"
                  >
                    {item}
                  </Button>
                ),
              )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
            className="gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          Page {page} of {totalPages} · Showing {products.length} of {totalProducts} products
        </p>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
