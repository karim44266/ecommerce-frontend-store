'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const { user } = useAuth()

  const shipping = subtotal >= 50 ? 0 : 5.99
  const total = subtotal + shipping

  if (itemCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-6">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/40 mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Looks like you haven&apos;t added anything yet. Browse our catalog and find something you love!
        </p>
        <Link href="/products">
          <Button size="lg" className="gap-2">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Your Cart
          <span className="ml-2 text-lg font-normal text-muted-foreground">
            ({itemCount} item{itemCount !== 1 ? 's' : ''})
          </span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id} className="py-0">
              <CardContent className="flex gap-4 p-4">
                {/* Image */}
                <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted border">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {item.product.category}
                      </p>
                      <Link href={`/products/${item.product.id}`}>
                        <p className="font-semibold text-foreground hover:underline line-clamp-2 text-sm sm:text-base">
                          {item.product.name}
                        </p>
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors flex-shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {/* Quantity control */}
                    <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-muted transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-muted transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground">
                          ${item.product.price.toFixed(2)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base text-foreground">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {user ? (
                <Button size="lg" className="w-full gap-2">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="space-y-2">
                  <Link href="/login">
                    <Button size="lg" className="w-full">Sign in to Checkout</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="w-full">Create Account</Button>
                  </Link>
                </div>
              )}

              {/* Promo code */}
              <Separator />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Promo code"
                    className="pl-9 h-9 bg-muted/50"
                  />
                </div>
                <Button variant="outline" size="sm">Apply</Button>
              </div>
            </CardContent>
          </Card>

          <Link href="/products">
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              ← Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
