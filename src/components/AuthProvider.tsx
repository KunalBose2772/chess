'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'

/**
 * Initialises the Supabase auth listener and populates the Zustand store.
 * Must be rendered once near the root of the app (in layout.tsx).
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refreshProfile } = useAuthStore()
  const initialised = useRef(false)

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true

    refreshProfile()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
      refreshProfile()
    })

    return () => subscription.unsubscribe()
  }, [refreshProfile])

  return <>{children}</>
}
