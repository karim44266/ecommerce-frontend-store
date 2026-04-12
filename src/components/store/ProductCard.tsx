'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
  }

  const inStock = product.stock > 0
  const lowStock = product.stock > 0 && product.stock <= 5

  return (
    <Link href={`/products/${product.id}`} className={cn('group block', className)}>
      <Card className="overflow-hidden py-0 gap-0 hover:shadow-lg transition-all duration-300 border-border hover:border-primary/30 hw-lift">
        {/* Product image */}
        <div className="relative aspect-[4/3] bg-muted/50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover hw-img-zoom"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
          {/* Stock badges */}
          {lowStock && (
            <Badge className="absolute top-2.5 left-2.5 bg-amber-600 text-white border-0 text-[10px] font-bold uppercase tracking-wide hw-stock-pulse">
              Only {product.stock} left
            </Badge>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Badge variant="default" className="bg-hw-dark text-white text-xs px-4 py-1.5 font-semibold uppercase tracking-wide">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <CardContent className="p-4 space-y-2">
          {/* Category */}
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
            {product.category || 'General'}
          </p>

          {/* Name */}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* SKU */}
          <p className="text-[10px] text-muted-foreground font-mono">
            SKU: {product.sku}
          </p>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'inline-block w-1.5 h-1.5 rounded-full',
              inStock ? 'bg-hw-green' : 'bg-destructive',
            )} />
            <span className={cn(
              'text-[11px] font-medium',
              inStock ? 'text-hw-green' : 'text-destructive',
            )}>
              {inStock ? (lowStock ? `${product.stock} in stock` : 'In Stock') : 'Out of Stock'}
            </span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-1.5">
            <span className="text-lg font-bold text-foreground hw-price">
              ${product.price.toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!inStock}
              className="gap-1 text-xs font-semibold"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
