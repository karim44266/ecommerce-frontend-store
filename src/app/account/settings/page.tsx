'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { getCurrentUser, updateProfile } from '@/lib/api'

export default function AccountSettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login?next=/account/settings')
      return
    }

    let cancelled = false
    setLoading(true)

    getCurrentUser()
      .then((profile) => {
        if (!cancelled) {
          setName(profile.name || '')
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load settings')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [authLoading, user, router])

  const onSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const result = await updateProfile({ name: name.trim() || undefined })
      setName(result.name || '')
      setMessage('Profile updated successfully.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
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
      <Link href="/account" className="inline-flex">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Account Center
        </Button>
      </Link>

      <h1 className="font-display text-3xl uppercase tracking-tight font-bold hw-fade-up">Account Settings</h1>

      <Card className="hw-lift">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wide">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSaveProfile}>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we address you?"
                maxLength={120}
              />
            </div>

            <Button type="submit" disabled={saving} className="hw-glow">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="hw-lift">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Multi-factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">MFA Status</p>
              <p className="text-sm text-muted-foreground">
                  Toggle and manage multi-factor authentication from the dedicated security page.
              </p>
            </div>
              <Link href="/account/mfa">
                <Button className="hw-glow">Manage MFA</Button>
              </Link>
          </div>
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
