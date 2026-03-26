'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, ArrowLeft, Truck, MapPin, CreditCard,
  ShieldCheck, Package, Check, Loader2, Banknote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createOrder } from '@/lib/api'

/* ── 2-step checkout ─────────────────────────────────────────── */
type Step = 'shipping' | 'review'

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'shipping', label: 'Shipping', icon: MapPin },
  { key: 'review', label: 'Review & Pay', icon: CreditCard },
]

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.key === current)
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const done = i < idx
        const active = i === idx
        return (
          <div key={step.key} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`hidden sm:block h-px w-8 md:w-14 ${done || active ? 'bg-primary' : 'bg-border'}`} />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  done
                    ? 'bg-hw-green text-white'
                    : active
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden sm:inline text-sm font-semibold uppercase tracking-wide ${
                  active ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { user, token } = useAuth()

  const [step, setStep] = useState<Step>('shipping')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    clientEmail: '',
    clientPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })

  const shippingCost = subtotal >= 75 ? 0 : 9.99
  const total = subtotal + shippingCost

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  /* Ship guard */
  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Package className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-3">
          Nothing to Checkout
        </h1>
        <p className="text-muted-foreground mb-8">Add some products to your cart first.</p>
        <Button asChild size="lg" className="uppercase font-semibold tracking-wide">
          <Link href="/products">Browse Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    )
  }

  /* Auth guard */
  if (!user || !token) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight mb-3">
          Sign in Required
        </h1>
        <p className="text-muted-foreground mb-8">Please sign in or create an account to complete your purchase.</p>
        <div className="flex justify-center gap-3">
          <Button asChild size="lg" className="uppercase font-semibold tracking-wide">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="uppercase font-semibold tracking-wide">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    )
  }

  const canProceed =
    form.fullName.trim() &&
    form.clientEmail.trim() &&
    form.clientPhone.trim() &&
    form.addressLine1.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.postalCode.trim() &&
    form.country.trim()

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError('')
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shippingAddress: {
          fullName: form.fullName,
          clientEmail: form.clientEmail,
          clientPhone: form.clientPhone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2 || undefined,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
      })
      clearCart()
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header */}
      <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight mb-2">
        Checkout
      </h1>
      <StepIndicator current={step} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* ── Step 1: Shipping ────────────────────────────── */}
          {step === 'shipping' && (
            <Card className="py-0 gap-0 overflow-hidden">
              <div className="bg-hw-dark text-white px-6 py-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                  Shipping Address
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wide mb-1.5">
                      Full Name *
                    </Label>
                    <Input id="fullName" value={form.fullName} onChange={set('fullName')} placeholder="John Smith" />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail" className="text-xs font-semibold uppercase tracking-wide mb-1.5">Client Email *</Label>
                    <Input id="clientEmail" type="email" value={form.clientEmail} onChange={set('clientEmail')} placeholder="client@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone" className="text-xs font-semibold uppercase tracking-wide mb-1.5">Client Phone *</Label>
                    <Input id="clientPhone" value={form.clientPhone} onChange={set('clientPhone')} placeholder="+1 555 123 4567" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address1" className="text-xs font-semibold uppercase tracking-wide mb-1.5">
                      Address Line 1 *
                    </Label>
                    <Input id="address1" value={form.addressLine1} onChange={set('addressLine1')} placeholder="123 Builder St" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address2" className="text-xs font-semibold uppercase tracking-wide mb-1.5">
                      Address Line 2
                    </Label>
                    <Input id="address2" value={form.addressLine2} onChange={set('addressLine2')} placeholder="Apt, suite, unit (optional)" />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wide mb-1.5">City *</Label>
                    <Input id="city" value={form.city} onChange={set('city')} placeholder="New York" />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-xs font-semibold uppercase tracking-wide mb-1.5">State *</Label>
                    <Input id="state" value={form.state} onChange={set('state')} placeholder="NY" />
                  </div>
                  <div>
                    <Label htmlFor="zip" className="text-xs font-semibold uppercase tracking-wide mb-1.5">Postal Code *</Label>
                    <Input id="zip" value={form.postalCode} onChange={set('postalCode')} placeholder="10001" />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-xs font-semibold uppercase tracking-wide mb-1.5">Country *</Label>
                    <Input id="country" value={form.country} onChange={set('country')} placeholder="US" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    size="lg"
                    disabled={!canProceed}
                    onClick={() => setStep('review')}
                    className="uppercase font-bold tracking-wide"
                  >
                    Continue to Review <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Step 2: Review ─────────────────────────────── */}
          {step === 'review' && (
            <div className="space-y-5">
              {/* Shipping summary */}
              <Card className="py-0 gap-0 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-3 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-display text-sm font-bold uppercase tracking-tight">Shipping To</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep('shipping')} className="text-xs">
                    <ArrowLeft className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>
                <CardContent className="px-6 py-4">
                  <p className="text-sm font-semibold">{form.fullName}</p>
                  <p className="text-sm text-muted-foreground">{form.clientEmail} · {form.clientPhone}</p>
                  <p className="text-sm text-muted-foreground">{form.addressLine1}</p>
                  {form.addressLine2 && <p className="text-sm text-muted-foreground">{form.addressLine2}</p>}
                  <p className="text-sm text-muted-foreground">
                    {form.city}, {form.state} {form.postalCode}, {form.country}
                  </p>
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card className="py-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-3 bg-muted/50">
                  <Banknote className="h-4 w-4 text-primary" />
                  <span className="font-display text-sm font-bold uppercase tracking-tight">Payment Method</span>
                </div>
                <CardContent className="px-6 py-4">
                  <div className="flex items-center gap-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 p-3 border border-amber-200 dark:border-amber-500/20">
                    <Banknote className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold">Cash on Delivery (COD)</p>
                      <p className="text-xs text-muted-foreground">Pay when your order arrives at your door</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card className="py-0 gap-0 overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-3 bg-muted/50">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-display text-sm font-bold uppercase tracking-tight">
                    Items ({items.length})
                  </span>
                </div>
                <CardContent className="p-0">
                  {items.map((item, i) => (
                    <div key={item.product.id}>
                      {i > 0 && <Separator />}
                      <div className="flex items-center gap-4 px-6 py-3">
                        <div className="relative h-14 w-14 shrink-0 rounded-md overflow-hidden bg-muted/50">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="hw-price text-sm font-bold shrink-0">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
                  {error}
                </div>
              )}

              {/* Place order */}
              <Button
                size="lg"
                className="w-full uppercase font-bold tracking-wide text-base"
                disabled={loading}
                onClick={handlePlaceOrder}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <>Place Order &mdash; ${total.toFixed(2)}</>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 py-0 gap-0">
            <div className="bg-hw-dark text-white px-6 py-4 rounded-t-lg">
              <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                Order Summary
              </h2>
            </div>
            <CardContent className="p-6 space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">
                    {item.product.name} &times; {item.quantity}
                  </span>
                  <span className="hw-price font-medium shrink-0">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="hw-price font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className={`hw-price font-semibold ${shippingCost === 0 ? 'text-hw-green' : ''}`}>
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-1">
                <span className="font-display text-base font-bold uppercase">Total</span>
                <span className="hw-price text-xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
