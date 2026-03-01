'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, MapPin, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { createOrder } from '@/lib/api'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, itemCount, subtotal, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()

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

  const updateField = (field: string, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }))

  const shipping = subtotal >= 50 ? 0 : 5.99
  const total = subtotal + shipping

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/login?redirect=/checkout')
    return null
  }

  // Redirect to cart if cart is empty
  if (!authLoading && itemCount === 0) {
    router.push('/cart')
    return null
  }

  const canSubmit =
    address.fullName.trim().length > 0 &&
    address.addressLine1.trim().length > 0 &&
    address.city.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.postalCode.trim().length > 0 &&
    !submitting

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    if (
      !address.fullName ||
      !address.addressLine1 ||
      !address.city ||
      !address.state ||
      !address.postalCode
    ) {
      setError('Please fill in all required address fields.')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const order = await createOrder({
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          ...address,
          addressLine2: address.addressLine2 || undefined,
        },
      })
      clearCart()
      router.push(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back to cart */}
      <Link
        href="/cart"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Shipping form */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={address.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
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
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={address.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
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
                    <Label htmlFor="postalCode">ZIP / Postal Code</Label>
                    <Input
                      id="postalCode"
                      placeholder="10001"
                      value={address.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
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

        {/* Order summary */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.product.id} className="flex gap-3 items-start">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0 border">
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

              <Separator />

              {/* Totals */}
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
                <Separator />
                <div className="flex justify-between font-bold text-base text-foreground">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Place order */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={!canSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing Order…
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing this order you agree to our terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </form>
    </div>
  )
}
