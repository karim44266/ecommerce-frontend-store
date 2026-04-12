'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { getCurrentUser, toggleMfa } from '@/lib/api'

export default function ManageMfaPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?next=/account/mfa')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    getCurrentUser()
      .then((profile) => {
        if (!cancelled) setMfaEnabled(Boolean(profile.mfaEnabled))
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load MFA settings')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, user, router])

  const onToggleMfa = async (enabled: boolean) => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const response = await toggleMfa(enabled)
      setMfaEnabled(response.mfaEnabled)
      setMessage(response.mfaEnabled ? 'MFA enabled successfully.' : 'MFA disabled successfully.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update MFA')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link href="/account/settings" className="inline-flex">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Account Settings
        </Button>
      </Link>

      <h1 className="font-display text-3xl uppercase tracking-tight font-bold hw-fade-up">Manage MFA</h1>

      <Card className="hw-lift">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wide flex items-center gap-2">
            {mfaEnabled ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            )}
            Multi-factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {mfaEnabled
              ? 'MFA is currently enabled. Your account requires one-time code verification on login.'
              : 'MFA is currently disabled. Enable it to add an extra layer of protection to your account.'}
          </p>

          <Button
            onClick={() => onToggleMfa(!mfaEnabled)}
            disabled={saving}
            variant={mfaEnabled ? 'outline' : 'default'}
            className={mfaEnabled ? '' : 'hw-glow'}
          >
            {saving ? 'Updating...' : mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
          </Button>
        </CardContent>
      </Card>

      {message && (
        <p className="text-sm rounded-lg border border-hw-green/40 bg-hw-green/10 px-3 py-2 text-hw-dark dark:text-white">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
