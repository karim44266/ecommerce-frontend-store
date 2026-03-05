'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Loader2,
  CheckCircle2,
  ClipboardList,
  Banknote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/lib/api'

/* ── Step indicator ───────────────────────────────────────────────── */

const STEPS = ['Shipping', 'Review'] as const
type Step = (typeof STEPS)[number]

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <div key={step} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-8 sm:w-12 ${done || active ? 'bg-foreground' : 'bg-muted-foreground/30'}`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  done
                    ? 'bg-foreground text-background border-foreground'
                    : active
                      ? 'border-foreground text-foreground'
                      : 'border-muted-foreground/30 text-muted-foreground/50'
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden sm:inline text-sm font-medium ${
                  done || active ? 'text-foreground' : 'text-muted-foreground/50'
                }`}
              >
                {step}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────── */

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { items, subtotal, itemCount, clearCart } = useCart()

  const [step, setStep] = useState<Step>('Shipping')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [address, setAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  })

  // Order state (set after placing order)
  const [orderId, setOrderId] = useState<string | null>(null)

  const updateField = (field: string, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }))

  const shipping = subtotal >= 50 ? 0 : 9.99
  const total = subtotal + shipping

  /* ── Auth guards ─────────────────────────────────────────────── */

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="h-8 w-8 border-4 border-muted border-t-foreground rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!user) {
    router.push('/login?redirect=/checkout')
    return null
  }

  if (items.length === 0 && !orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto" />
        <h1 className="text-xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add items to your cart before checking out.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    )
  }

  /* ── Validation helpers ──────────────────────────────────────── */

  const addressValid =
    address.fullName.trim() !== '' &&
    address.addressLine1.trim() !== '' &&
    address.city.trim() !== '' &&
    address.state.trim() !== '' &&
    address.postalCode.trim() !== '' &&
    address.country.trim() !== ''

  /* ── Step handlers ───────────────────────────────────────────── */

  const goToReview = (e: FormEvent) => {
    e.preventDefault()
    if (!addressValid) {
      setError('Please fill in all required address fields.')
      return
    }
    setError('')
    setStep('Review')
  }

  const placeOrder = async () => {
    setSubmitting(true)
    setError('')
    try {
      const order = await createOrder({
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        shippingAddress: {
          ...address,
          addressLine2: address.addressLine2 || undefined,
        },
      })
      setOrderId(order.id)
      clearCart()
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order.')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <button
        onClick={() => {
          if (step === 'Review') setStep('Shipping')
          else if (step === 'Shipping') router.back()
        }}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-foreground">Checkout</h1>

      <StepIndicator current={step} />

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">{error}</div>
      )}

      {/* ═══════════ STEP 1: Shipping ═══════════ */}
      {step === 'Shipping' && (
        <form onSubmit={goToReview}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={address.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      placeholder="123 Main Street"
                      value={address.addressLine1}
                      onChange={(e) => updateField('addressLine1', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
                    <Input
                      id="addressLine2"
                      placeholder="Apt, Suite, Unit, etc."
                      value={address.addressLine2}
                      onChange={(e) => updateField('addressLine2', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={address.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={address.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">ZIP / Postal Code *</Label>
                      <Input
                        id="postalCode"
                        placeholder="10001"
                        value={address.postalCode}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        placeholder="US"
                        value={address.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mini summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{itemCount} items</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <Button type="submit" className="w-full gap-2 mt-2" disabled={!addressValid}>
                    Continue to Review <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      )}

      {/* ═══════════ STEP 2: Review & Place Order ═══════════ */}
      {step === 'Review' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Shipping Address
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setStep('Shipping')}>
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{address.fullName}</p>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
              </CardContent>
            </Card>

            {/* Cart items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" /> Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {items.map((item) => (
                    <li key={item.product.id} className="flex gap-4 py-3 items-center">
                      <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground flex-shrink-0">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Cash on delivery notice */}
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <CardContent className="flex items-start gap-3 pt-6">
                <Banknote className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-300">Cash on Delivery</p>
                  <p className="text-amber-700 dark:text-amber-400/80">
                    No online payment is required. You will pay in cash when the delivery staff
                    brings the package to your door.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order total + place order */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" /> Order Total
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
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
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment</span>
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full gap-2 mt-2"
                  disabled={submitting}
                  onClick={placeOrder}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Placing Order…
                    </>
                  ) : (
                    <>
                      Place Order <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By placing this order you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
