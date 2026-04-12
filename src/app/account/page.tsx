'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRound, ShieldCheck, ShieldAlert, Settings, KeyRound, Loader2, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { getCurrentUser, type CurrentUserProfile } from '@/lib/api'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?next=/account')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    getCurrentUser()
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load account profile')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <Card className="border-destructive/30">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-destructive font-semibold">{error}</p>
            <Button onClick={() => router.refresh()} className="hw-glow">Try again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link href="/" className="inline-flex">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Button>
      </Link>

      <section className="relative overflow-hidden rounded-2xl border border-border bg-card hw-dot-grid hw-fade-up">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-blue-200/10" />
        <div className="relative p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground">Account Center</p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight mt-2">My Account</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Manage your profile, security, and MFA preferences from one place.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="hw-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display uppercase tracking-wide">
              <UserRound className="h-5 w-5 text-primary" /> Profile Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Name</p>
                <p className="font-medium mt-1">{profile?.name?.trim() || 'Not set yet'}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                <p className="font-medium mt-1 break-all">{profile?.email}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Primary Role</p>
                <div className="mt-1">
                  <Badge variant="secondary">{profile?.role || profile?.roles?.[0] || 'customer'}</Badge>
                </div>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                <div className="mt-1">
                  <Badge variant={profile?.status === 'blocked' ? 'destructive' : 'default'}>
                    {profile?.status || 'active'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Link href="/account/settings">
                <Button className="hw-glow"><Settings className="h-4 w-4 mr-2" /> Account Settings</Button>
              </Link>
              <Link href="/account/security">
                <Button variant="outline"><KeyRound className="h-4 w-4 mr-2" /> Security</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hw-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display uppercase tracking-wide">
              {profile?.mfaEnabled ? (
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              )}
              Security Posture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">MFA</p>
              <p className="font-medium mt-1">
                {profile?.mfaEnabled ? 'Enabled — account is protected' : 'Disabled — enable for stronger protection'}
              </p>
            </div>

            <Link href="/account/mfa" className="block">
              <Button variant="outline" className="w-full">Manage MFA</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
