'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { createOrder } from '@/lib/api'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { items, subtotal, clearCart } = useCart()
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

  if (items.length === 0) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.fullName || !address.addressLine1 || !address.city || !address.state || !address.postalCode) {
      setError('Please fill in all required address fields.')
      return
    }

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
      clearCart()
      router.push(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-foreground">Checkout</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={address.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                value={address.addressLine1}
                onChange={(e) => updateField('addressLine1', e.target.value)}
                placeholder="123 Main St"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={address.addressLine2}
                onChange={(e) => updateField('addressLine2', e.target.value)}
                placeholder="Apt #4"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={address.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  value={address.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={address.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.product.id} className="flex justify-between items-center py-3 text-sm">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="flex justify-between font-bold text-lg pt-1">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Placing Order...' : `Place Order · $${subtotal.toFixed(2)}`}
        </Button>
      </form>
    </div>
  )
}
