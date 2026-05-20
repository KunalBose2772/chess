/**
 * Global auth & user state using Zustand.
 * Keeps the Supabase session in sync across all client components.
 */
'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  username: string
  rating: number
  games_played: number
  wins: number
  losses: number
  draws: number
  avatar_url?: string
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  setUser: (user: UserProfile | null) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null })
  },

  refreshProfile: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ user: null, loading: false })
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    set({ user: profile ?? null, loading: false })
  },
}))
