'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getMe, login as apiLogin, register as apiRegister } from '@/lib/api'

interface AuthUser {
  userId: string
  email: string
  roles: string[]
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ mfaRequired?: boolean }>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setTokenAndLoadUser: (accessToken: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem('store_token')
    if (!stored) {
      queueMicrotask(() => setLoading(false))
      return
    }
    queueMicrotask(() => setToken(stored))
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('store_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    if (res.accessToken) {
      localStorage.setItem('store_token', res.accessToken)
      setToken(res.accessToken)
      const me = await getMe()
      setUser(me)
    }
    return { mfaRequired: res.mfaRequired }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiRegister(name, email, password)
    if (res.accessToken) {
      localStorage.setItem('store_token', res.accessToken)
      setToken(res.accessToken)
      const me = await getMe()
      setUser(me)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('store_token')
    setToken(null)
    setUser(null)
  }, [])

  const setTokenAndLoadUser = useCallback(async (accessToken: string) => {
    localStorage.setItem('store_token', accessToken)
    setToken(accessToken)
    const me = await getMe()
    setUser(me)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setTokenAndLoadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
