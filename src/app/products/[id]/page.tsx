'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart, ArrowLeft, Minus, Plus, Package,
  Truck, ShieldCheck, RotateCcw, CheckCircle2,
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
        const all = await getProducts({ category: p.category || undefined })
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
        <Package className="h-12 w-12 text-muted-foreground/30 mx-auto" />
        <h1 className="font-display text-2xl font-bold text-foreground uppercase">Product Not Found</h1>
        <p className="text-muted-foreground text-sm">This item may have been removed or doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    )
  }

  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="text-muted-foreground/40">/</span>
        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
        {product.category && (
          <>
            <span className="text-muted-foreground/40">/</span>
            <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground transition-colors">
              {product.category}
            </Link>
          </>
        )}
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main product section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Image */}
        <Card className="overflow-hidden py-0 border-border">
          <div className="relative aspect-square bg-muted/30">
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
        <div className="space-y-5">
          <div>
            {product.category && (
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                {product.category}
              </p>
            )}
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight uppercase tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* SKU */}
          <p className="text-xs text-muted-foreground font-mono">SKU: {product.sku}</p>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-foreground hw-price">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ${(product.price * 1.2).toFixed(2)}
            </span>
            <Badge className="bg-emerald-600 text-white border-0 text-xs font-bold uppercase">
              Save 17%
            </Badge>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <span className={cn(
              'inline-block w-2 h-2 rounded-full',
              inStock ? 'bg-hw-green' : 'bg-destructive',
            )} />
            <Badge variant={inStock ? (lowStock ? 'outline' : 'secondary') : 'destructive'} className="gap-1 text-xs">
              <Package className="h-3 w-3" />
              {product.stock > 5
                ? 'In Stock — Ready to Ship'
                : lowStock
                ? `Only ${product.stock} left — Order soon`
                : 'Out of Stock'}
            </Badge>
          </div>

          {/* Quantity + Add to cart */}
          {inStock && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">Qty</span>
                <div className="flex items-center gap-0 border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold border-x">{quantity}</span>
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
                  className={cn(
                    'flex-1 gap-2 text-sm font-semibold uppercase tracking-wide transition-all',
                    added && 'bg-emerald-600 hover:bg-emerald-600',
                  )}
                >
                  {added ? (
                    <><CheckCircle2 className="h-5 w-5" /> Added to Cart!</>
                  ) : (
                    <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
                  )}
                </Button>
                <Link href="/cart" className="flex-shrink-0">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Trust badges */}
          <Separator />
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Truck className="h-4 w-4" />, label: 'Free shipping $75+' },
              { icon: <RotateCcw className="h-4 w-4" />, label: '30-day returns' },
              { icon: <ShieldCheck className="h-4 w-4" />, label: 'Pro guaranteed' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1.5 text-center text-muted-foreground">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-foreground uppercase tracking-tight">
              {product.category ? `More in ${product.category}` : 'Related Products'}
            </h2>
            {product.category && (
              <Link href={`/products?category=${encodeURIComponent(product.category)}`}>
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View all <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                </Button>
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
