'use client'

import { useState, useEffect, useCallback } from 'react'
import { parse } from 'cookie'
import { AUTH_COOKIE } from '@/lib/auth'

interface User {
  id: string
  name: string
  email: string
}

function getToken(): string | null {
  if (typeof document === 'undefined') return null
  const fromStorage =
    localStorage.getItem('Authorization') || localStorage.getItem('token')
  if (fromStorage) return fromStorage
  const cookies = parse(document.cookie ?? '')
  return cookies[AUTH_COOKIE] ?? null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User)
        return
      } catch {
        // ignore parse errors
      }
    }

    const token = getToken()
    if (token) {
      fetch('/api/auth/me', { credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setUser(data as User)
            localStorage.setItem('user', JSON.stringify(data))
          }
        })
        .catch(() => {})
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (!res.ok) {
      throw new Error('Login failed')
    }
    const data = (await res.json()) as User
    setUser(data)
    localStorage.setItem('user', JSON.stringify(data))
    return data
  }, [])

  const logout = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.cookie = `${AUTH_COOKIE}=; Max-Age=0; path=/`
    }
    localStorage.removeItem('user')
    localStorage.removeItem('Authorization')
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  return { user, login, logout }
}

