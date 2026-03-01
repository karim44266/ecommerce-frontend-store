'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { getOrders, type OrderSummary } from '@/lib/api'

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  FAILED: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?redirect=/orders')
      return
    }

    let cancelled = false
    setLoading(true)
    getOrders(page, 10)
      .then((res) => {
        if (!cancelled) {
          setOrders(res.data)
          setTotalPages(res.meta.totalPages)
        }
      })
      .catch(() => {
        if (!cancelled) setOrders([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [user, authLoading, router, page])

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track and manage your orders
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <Package className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <div>
              <p className="font-semibold text-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start shopping to see your orders here.
              </p>
            </div>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-foreground/70 truncate">
                          {order.id.slice(0, 8)}...
                        </p>
                        <Badge className={`text-xs ${STATUS_COLORS[order.status] || ''}`}>
                          {order.status.replaceAll('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {order.carrier && order.trackingNumber && (
                          <span className="text-xs">
                            {order.carrier}: {order.trackingNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
