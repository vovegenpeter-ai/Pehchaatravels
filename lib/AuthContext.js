'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'pehchaan_user_cache'

function getCachedUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setCachedUser(user) {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch {}
}

export function AuthProvider({ children, initialUser = null }) {
  // Initialize synchronously with initialUser from server if present, or cached user in browser
  const [user, setUserState] = useState(() => {
    if (initialUser !== null) return initialUser
    return getCachedUser()
  })
  
  // authChecked is immediately true if initialUser was provided or if we have a cached user
  const [authChecked, setAuthChecked] = useState(() => initialUser !== null || getCachedUser() !== null)

  const setUser = useCallback((newUser) => {
    setUserState(newUser)
    setCachedUser(newUser)
    setAuthChecked(true)
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const fetched = data?.user || null
        setUser(fetched)
        return fetched
      } else {
        setUser(null)
        return null
      }
    } catch {
      setAuthChecked(true)
      return user
    }
  }, [setUser, user])

  // Sync if initialUser changes from server
  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser)
    }
  }, [initialUser, setUser])

  // Verify freshness in background on mount
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Listen to profile updates & cross-tab storage changes
  useEffect(() => {
    const handleProfileUpdated = () => {
      fetchUser()
    }
    const handleStorage = (e) => {
      if (e.key === AUTH_STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : null
          setUserState(updated)
          setAuthChecked(true)
        } catch {}
      }
    }

    window.addEventListener('user-profile-updated', handleProfileUpdated)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdated)
      window.removeEventListener('storage', handleStorage)
    }
  }, [fetchUser])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' })
    } catch {}
    setUser(null)
    window.dispatchEvent(new Event('user-profile-updated'))
  }, [setUser])

  return (
    <AuthContext.Provider
      value={{
        user,
        authChecked,
        setUser,
        fetchUser,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
