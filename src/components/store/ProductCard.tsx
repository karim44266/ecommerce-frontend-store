'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
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

  return (
    <Link href={`/products/${product.id}`} className={cn('group block', className)}>
      <Card className="overflow-hidden py-0 gap-0 hover:shadow-md transition-shadow duration-200">
        {/* Product image */}
        <div className="relative aspect-square bg-neutral-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
          {product.stock <= 5 && product.stock > 0 && (
            <Badge className="absolute top-2 left-2 bg-amber-100 text-amber-800 border-amber-200">
              Only {product.stock} left
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <Badge variant="default" className="bg-neutral-800 text-white text-sm px-3 py-1">
                Out of stock
              </Badge>
            </div>
          )}
        </div>

        {/* Details */}
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {product.category || 'Uncategorized'}
          </p>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-muted-foreground transition-colors">
            {product.name}
          </h3>

          {/* Category label */}

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="gap-1"
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
