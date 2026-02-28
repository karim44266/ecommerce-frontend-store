'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Eye, EyeOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

const PERKS = [
  'Track your orders in real time',
  'Faster checkout on future visits',
  'Exclusive member-only deals',
  'Easy returns and refunds',
]

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const passwordStrength = () => {
    if (password.length === 0) return null
    if (password.length < 6) return { label: 'Too short', color: 'text-red-500', width: '25%', barColor: '#ef4444' }
    if (password.length < 8) return { label: 'Weak', color: 'text-amber-500', width: '50%', barColor: '#f59e0b' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: 'text-yellow-500', width: '70%', barColor: '#eab308' }
    return { label: 'Strong', color: 'text-green-600', width: '100%', barColor: '#16a34a' }
  }

  const strength = passwordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await register(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-4xl overflow-hidden py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left panel — form */}
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-foreground" />
              <span className="text-xl font-bold text-foreground">ShopNow</span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
              <p className="text-sm text-muted-foreground mt-1">Free forever. No credit card required.</p>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="space-y-1">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{ width: strength.width, backgroundColor: strength.barColor }}
                      />
                    </div>
                    <p className={`text-xs font-medium ${strength.color}`}>{strength.label}</p>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
            </p>
          </CardContent>

          {/* Right panel — perks */}
          <div className="hidden lg:flex flex-col justify-center bg-neutral-900 text-white p-10 space-y-8">
            <div>
              <h2 className="text-2xl font-bold leading-snug">Everything you need in one place.</h2>
              <p className="text-neutral-400 mt-2 text-sm">Join thousands of shoppers who trust ShopNow.</p>
            </div>
            <ul className="space-y-4">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3">
                  <span className="flex-shrink-0 rounded-full bg-white/10 p-1">
                    <Check className="h-4 w-4 text-white" />
                  </span>
                  <span className="text-sm text-neutral-200">{perk}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-xs">★</span>)}
              </div>
              <p className="text-sm text-neutral-200 italic">
                &ldquo;Best online store I&apos;ve used. Fast delivery and everything as described!&rdquo;
              </p>
              <p className="text-xs text-neutral-400">— Sarah M., verified buyer</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
