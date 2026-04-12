'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Wrench, UserPlus, Eye, EyeOff, Loader2,
  Truck, Calculator, ClipboardList, ShieldCheck, Percent, Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

const PRO_PERKS = [
  { icon: Percent, title: 'Volume Pricing', desc: 'Bulk discounts for contractors' },
  { icon: ClipboardList, title: 'Job Tracking', desc: 'Organize orders by project' },
  { icon: Truck, title: 'Priority Shipping', desc: 'Get materials on time, every time' },
  { icon: Calculator, title: 'Quote Builder', desc: 'Estimate project costs easily' },
  { icon: ShieldCheck, title: 'Pro Guarantee', desc: 'Extended warranty on power tools' },
  { icon: Headphones, title: 'Dedicated Support', desc: 'Direct line to trade specialists' },
]

function StrengthMeter({ password }: { password: string }) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
  const colors = ['', 'bg-destructive', 'bg-amber-500', 'bg-amber-400', 'bg-emerald-500', 'bg-emerald-500']

  if (!password) return null

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < score ? colors[score] : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${score <= 2 ? 'text-destructive' : 'text-emerald-600'}`}>
        {labels[score]}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordsMatch = password === confirm
  const canSubmit = name.trim() && email && password.length >= 8 && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    try {
      await register(name.trim(), email, password)
      router.push('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-stretch">
      {/* Left panel — Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                <Wrench className="h-6 w-6" />
              </div>
              <span className="font-display text-2xl font-bold uppercase tracking-tight text-hw-dark dark:text-white">
                ProBuild
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold uppercase tracking-tight">
              Create Your Account
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join thousands of pros and DIYers
            </p>
          </div>

          <Card className="py-0 gap-0 overflow-hidden">
            <div className="h-1 bg-primary" />
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide mb-1.5">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide mb-1.5">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide mb-1.5">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <StrengthMeter password={password} />
                </div>

                <div>
                  <Label htmlFor="confirm" className="text-xs font-semibold uppercase tracking-wide mb-1.5">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    autoComplete="new-password"
                  />
                  {confirm && !passwordsMatch && (
                    <p className="text-[11px] text-destructive font-medium mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading || !canSubmit}
                  className="w-full uppercase font-bold tracking-wide"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                  ) : (
                    <><UserPlus className="mr-2 h-4 w-4" /> Create Account</>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in here
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-[11px] text-muted-foreground mt-4">
            Your data is secure &bull; 256-bit encryption &bull; ProBuild Supply
          </p>
        </div>
      </div>

      {/* Right panel — Perks (desktop only) */}
      <div className="hidden lg:flex lg:w-[420px] bg-hw-dark text-white flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 hw-dot-grid opacity-30" />
        <div className="relative z-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight mb-2">
            Why Go Pro?
          </h2>
          <p className="text-white/60 text-sm mb-8">
            ProBuild accounts unlock exclusive benefits for contractors, builders, and serious DIYers.
          </p>

          <div className="space-y-5">
            {PRO_PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-white/50">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
