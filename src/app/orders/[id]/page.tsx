'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package, Truck, CheckCircle2, Clock, XCircle, ArrowLeft, MapPin, BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { getOrder, type OrderStatus } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ShippingAddress {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock },
  { key: 'ACCEPTED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'DELIVERED', label: 'Delivered', icon: Truck },
  { key: 'COMPLETED', label: 'Completed', icon: BadgeCheck },
]

const TERMINAL_FAILED = ['CANCELLED', 'REFUNDED', 'FAILED']

function getStepIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status)
  return idx === -1 ? 0 : idx
}

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const orderId = params.id as string

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push(`/login?redirect=/orders/${orderId}`)
      return
    }
    let cancelled = false
    getOrder(orderId)
      .then((data) => { if (!cancelled) setOrder(data) })
      .catch(() => { if (!cancelled) setError('Order not found or you do not have access.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [orderId, user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <XCircle className="h-12 w-12 text-muted-foreground/40 mx-auto" />
        <h1 className="text-xl font-bold text-foreground">Order not found</h1>
        <p className="text-muted-foreground">{error || 'This order does not exist or is unavailable.'}</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  const isFailed = TERMINAL_FAILED.includes(order.status)
  const currentStep = getStepIndex(order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back */}
      <Link
        href="/orders"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Orders
      </Link>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Order Tracking</h1>
        <p className="text-sm text-muted-foreground">
          Order <span className="font-mono text-foreground/70">{order.id}</span>
          {' · '}
          Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Status timeline */}
      <Card>
        <CardContent className="p-6">
          {isFailed ? (
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-6 w-6" />
              <div>
                <p className="font-semibold">Order {order.status.toLowerCase()}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  This order was cancelled or refunded. Contact support if you need help.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon
                const isCompleted = idx <= currentStep
                const isCurrent = idx === currentStep
                const isLast = idx === STATUS_STEPS.length - 1

                return (
                  <div key={step.key} className="flex items-start gap-4">
                    {/* Icon + line */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 transition-colors',
                        isCompleted
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'bg-background border-border text-muted-foreground/40',
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {!isLast && (
                        <div className={cn(
                          'w-0.5 h-10 mt-0.5',
                          idx < currentStep ? 'bg-primary' : 'bg-border',
                        )} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-4">
                      <p className={cn(
                        'text-sm font-semibold',
                        isCompleted ? 'text-foreground' : 'text-muted-foreground',
                      )}>
                        {step.label}
                        {isCurrent && (
                          <Badge className="ml-2 text-xs">Current</Badge>
                        )}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Last updated {new Date(order.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id || item.productId} className="flex justify-between items-center py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-foreground">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex justify-between font-bold text-foreground pt-1">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Tracking */}
      <div className="grid gap-6 sm:grid-cols-2">
        {order.shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-0.5">
              {typeof order.shippingAddress === 'object' ? (
                <>
                  <p className="font-semibold">{(order.shippingAddress as ShippingAddress).fullName}</p>
                  <p className="text-muted-foreground">{(order.shippingAddress as ShippingAddress).addressLine1}</p>
                  {(order.shippingAddress as ShippingAddress).addressLine2 && (
                    <p className="text-muted-foreground">{(order.shippingAddress as ShippingAddress).addressLine2}</p>
                  )}
                  <p className="text-muted-foreground">
                    {(order.shippingAddress as ShippingAddress).city}, {(order.shippingAddress as ShippingAddress).state} {(order.shippingAddress as ShippingAddress).postalCode}
                  </p>
                  <p className="text-muted-foreground">{(order.shippingAddress as ShippingAddress).country}</p>
                </>
              ) : (
                <p className="text-foreground">{String(order.shippingAddress)}</p>
              )}
            </CardContent>
          </Card>
        )}

        {(order.carrier || order.trackingNumber) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4" /> Tracking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {order.carrier && (
                <div>
                  <span className="text-muted-foreground">Carrier: </span>
                  <span className="font-medium">{order.carrier}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <span className="text-muted-foreground">Tracking #: </span>
                  <code className="font-mono text-foreground/70">{order.trackingNumber}</code>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {order.statusHistory.map((entry, idx) => {
                const isLast = idx === order.statusHistory!.length - 1
                return (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0',
                        isLast ? 'bg-primary' : 'bg-muted-foreground/30',
                      )} />
                      {!isLast && <div className="w-0.5 h-8 bg-border mt-0.5" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-sm">
                        <Badge variant={isLast ? 'default' : 'secondary'} className="text-xs mr-2">
                          {entry.status}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </p>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Link href="/products">
        <Button variant="outline" className="w-full">Continue Shopping</Button>
      </Link>
    </div>
  )
}
