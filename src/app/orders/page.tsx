'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight,
  ChevronLeft, ChevronsLeft, ChevronsRight, ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { getOrders, type OrderSummary } from '@/lib/api'

/* ── Status display helpers ──────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  PENDING:    { label: 'Pending',    variant: 'outline',      icon: Clock },
  ACCEPTED:   { label: 'Accepted',   variant: 'default',      icon: CheckCircle2 },
  PROCESSING: { label: 'Processing', variant: 'secondary',    icon: Package },
  DELIVERED:  { label: 'Delivered',  variant: 'default',      icon: CheckCircle2 },
  COMPLETED:  { label: 'Completed',  variant: 'default',      icon: CheckCircle2 },
  CANCELLED:  { label: 'Cancelled',  variant: 'destructive',  icon: XCircle },
  REFUNDED:   { label: 'Refunded',   variant: 'destructive',  icon: XCircle },
  FAILED:     { label: 'Failed',     variant: 'destructive',  icon: XCircle },
}

function statusBadge(status: string) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, variant: 'outline' as const, icon: Clock }
  const Icon = cfg.icon
  return (
    <Badge variant={cfg.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

/* ── Page ─────────────────────────────────────────────────────────── */

const PAGE_SIZE = 10

export default function OrdersListPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?redirect=/orders')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    getOrders(page, PAGE_SIZE)
      .then((res) => {
        if (!cancelled) {
          setOrders(res.data)
          setMeta(res.meta)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load orders. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [page, user, authLoading, router])

  /* ── Loading skeleton ─────────────────────────────────────────── */
  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-3 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  /* ── Error state ──────────────────────────────────────────────── */
  if (error && orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-destructive/10 mx-auto">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => setPage(1)} className="hw-glow">Try again</Button>
      </div>
    )
  }

  /* ── Empty state ──────────────────────────────────────────────── */
  if (!loading && orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-muted mx-auto">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight">No orders yet</h1>
        <p className="text-muted-foreground">
          Once you place an order, it will appear here so you can track its progress.
        </p>
        <Link href="/products">
          <Button className="hw-glow">Browse Products</Button>
        </Link>
      </div>
    )
  }

  /* ── Orders list ──────────────────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Header */}
      <div className="hw-fade-up">
        <h1 className="font-display text-3xl font-bold text-foreground uppercase tracking-tight">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.total} order{meta.total !== 1 ? 's' : ''} total
        </p>
      </div>

      {/* List */}
      <div className="space-y-3">
        {orders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)

          return (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:bg-muted/40 transition-all cursor-pointer group hw-lift border-border hover:border-primary/30">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {statusBadge(order.status)}
                        <span className="text-xs text-muted-foreground">{date}</span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        #{order.id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                        {' · '}
                        <span className="font-semibold text-foreground">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50 mt-1 flex-shrink-0 group-hover:text-foreground transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={meta.page <= 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={meta.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage(meta.totalPages)}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
