'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2, Package, ArrowRight, MapPin,
  Truck, FileText, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { getOrder, type OrderStatus } from '@/lib/api'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }
    getOrder(orderId)
      .then(setOrder)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load order'))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight mb-3">
          {error || 'Order not found'}
        </h1>
        <Button asChild className="uppercase font-semibold tracking-wide">
          <Link href="/orders">View My Orders</Link>
        </Button>
      </div>
    )
  }

  const address =
    typeof order.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
      {/* Success banner */}
      <div className="text-center mb-10">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600/15">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for your order. We&apos;re getting your tools and materials ready.
        </p>
      </div>

      {/* Order ID & Status */}
      <Card className="py-0 gap-0 overflow-hidden mb-6">
        <div className="bg-hw-dark text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="font-display text-base font-bold uppercase tracking-tight">
              Order Details
            </span>
          </div>
          <Badge className="bg-primary/20 text-primary border-0 font-mono text-xs">
            {order.status}
          </Badge>
        </div>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Order ID
              </p>
              <p className="text-sm font-mono font-semibold break-all">{order.id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Total
              </p>
              <p className="hw-price text-lg font-bold text-primary">
                ${Number(order.totalAmount).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Payment
              </p>
              <p className="text-sm font-semibold">Cash on Delivery</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Date
              </p>
              <p className="text-sm font-semibold">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping address */}
      <Card className="py-0 gap-0 overflow-hidden mb-6">
        <div className="flex items-center gap-2 px-6 py-3 bg-muted/50">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-display text-sm font-bold uppercase tracking-tight">Shipping Address</span>
        </div>
        <CardContent className="px-6 py-4">
          <p className="text-sm font-semibold">{address.fullName}</p>
          <p className="text-sm text-muted-foreground">{address.addressLine1}</p>
          {address.addressLine2 && <p className="text-sm text-muted-foreground">{address.addressLine2}</p>}
          <p className="text-sm text-muted-foreground">
            {address.city}, {address.state} {address.postalCode}, {address.country}
          </p>
        </CardContent>
      </Card>

      {/* Items ordered */}
      <Card className="py-0 gap-0 overflow-hidden mb-8">
        <div className="flex items-center gap-2 px-6 py-3 bg-muted/50">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-display text-sm font-bold uppercase tracking-tight">
            Items Ordered ({order.items.length})
          </span>
        </div>
        <CardContent className="p-0">
          {order.items.map((item, i) => (
            <div key={item.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="hw-price text-sm font-bold shrink-0">
                  ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg" className="uppercase font-bold tracking-wide">
          <Link href={`/orders/${order.id}`}>
            <Truck className="mr-2 h-4 w-4" /> Track Order
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="uppercase font-semibold tracking-wide">
          <Link href="/products">
            Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
