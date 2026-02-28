'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star, ShoppingCart, ArrowLeft, Minus, Plus, Package,
  Truck, ShieldCheck, RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/store/ProductCard'
import { useCart } from '@/context/CartContext'
import { getProduct, getProducts, type Product } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState(false)

  const id = params.id as string

  useEffect(() => {
    let cancelled = false
    getProduct(id)
      .then(async (p) => {
        if (cancelled) return
        setProduct(p)
        setError('')
        const all = await getProducts({ category: p.category })
        if (!cancelled) setRelated(all.filter((x) => x.id !== p.id).slice(0, 4))
      })
      .catch(() => { if (!cancelled) setError('Product not found') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
        <p className="text-4xl">😕</p>
        <h1 className="text-2xl font-bold text-foreground">Product not found</h1>
        <p className="text-muted-foreground">This item may have been removed or doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <Card className="overflow-hidden py-0">
          <div className="relative aspect-square bg-neutral-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </Card>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2 uppercase tracking-wider text-xs">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={cn('h-4 w-4', s <= Math.round(product.rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-neutral-200 text-neutral-200')} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ${(product.price * 1.2).toFixed(2)}
            </span>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              Save 17%
            </Badge>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Stock */}
          <Badge variant={product.stock > 5 ? 'secondary' : product.stock > 0 ? 'outline' : 'destructive'} className="gap-1">
            <Package className="h-3.5 w-3.5" />
            {product.stock > 5
              ? 'In stock'
              : product.stock > 0
              ? `Only ${product.stock} left in stock`
              : 'Out of stock'}
          </Badge>

          {/* Quantity + Add to cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  className={cn('flex-1 gap-2 transition-all', added && 'bg-green-600 hover:bg-green-600')}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {added ? 'Added to cart!' : 'Add to Cart'}
                </Button>
                <Link href="/cart" className="flex-shrink-0">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Trust */}
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Truck className="h-4 w-4" />, label: 'Free shipping over $50' },
              { icon: <RotateCcw className="h-4 w-4" />, label: '30-day returns' },
              { icon: <ShieldCheck className="h-4 w-4" />, label: 'Secure checkout' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 text-center text-muted-foreground">
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">More in {product.category}</h2>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
