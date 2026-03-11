'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight,
  Truck, ShieldCheck, RotateCcw, Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/context/CartContext'

const FREE_SHIPPING_THRESHOLD = 75

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart()

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99
  const total = subtotal + shippingCost
  const freeShippingDelta = FREE_SHIPPING_THRESHOLD - subtotal

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <ShoppingCart className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-3">
          Your Cart is Empty
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added any tools or materials yet. Browse our departments to get started.
        </p>
        <Button asChild size="lg" className="uppercase font-semibold tracking-wide">
          <Link href="/products">
            Browse Products <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight">
            Your Cart
          </h1>
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* Free shipping progress */}
      {freeShippingDelta > 0 && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">
              Add <span className="hw-price text-primary">${freeShippingDelta.toFixed(2)}</span> more for{' '}
              <span className="text-primary font-bold">FREE SHIPPING</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
            />
          </div>
        </div>
      )}
      {freeShippingDelta <= 0 && (
        <div className="mb-6 rounded-lg border border-hw-green/30 bg-hw-green/10 p-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-hw-green" />
          <span className="text-sm font-semibold text-hw-green">
            You&apos;ve unlocked FREE SHIPPING!
          </span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const inStock = item.product.stock > 0
            return (
              <Card key={item.product.id} className="overflow-hidden py-0 gap-0">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    {/* Product image */}
                    <Link
                      href={`/products/${item.product.id}`}
                      className="relative shrink-0 h-28 w-28 sm:h-32 sm:w-32 rounded-lg overflow-hidden bg-muted/50"
                    >
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                        unoptimized
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {item.product.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            {item.product.category}
                          </span>
                        )}
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="font-display text-base font-bold uppercase tracking-tight leading-tight line-clamp-2 hover:text-primary transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                          SKU: {item.product.sku}
                        </span>
                      </div>

                      {/* Stock indicator */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-hw-green' : 'bg-destructive'}`} />
                        <span className={`text-xs ${inStock ? 'text-hw-green' : 'text-destructive'}`}>
                          {inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    {/* Price on desktop */}
                    <div className="hidden sm:flex flex-col items-end justify-between">
                      <span className="hw-price text-lg font-bold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-muted-foreground hw-price">
                          ${item.product.price.toFixed(2)} each
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Actions row */}
                  <div className="flex items-center justify-between px-4 py-2.5">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-10 text-center text-sm font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Price on mobile */}
                    <span className="sm:hidden hw-price text-base font-bold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline text-xs">Remove</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 py-0 gap-0">
            <div className="bg-hw-dark text-white px-6 py-4 rounded-t-lg">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                Order Summary
              </h2>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span className="hw-price font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={`hw-price font-semibold ${shippingCost === 0 ? 'text-hw-green' : ''}`}>
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-display text-base font-bold uppercase">Total</span>
                <span className="hw-price text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button asChild size="lg" className="w-full uppercase font-bold tracking-wide text-base">
                <Link href="/checkout">
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <p className="text-[11px] text-center text-muted-foreground">
                Cash on Delivery &bull; 30-Day Returns
              </p>
            </CardContent>
          </Card>

          {/* Trust badges */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { icon: Truck, label: 'Free Ship $75+' },
              { icon: ShieldCheck, label: 'Guaranteed' },
              { icon: RotateCcw, label: '30-Day Return' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
