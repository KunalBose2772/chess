'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import { Swords, Clock, Zap, Target, Crown, Loader2, X, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

const TIME_CONTROLS = [
  { id: 'bullet', label: 'Bullet', icon: Zap, time: '1+0', description: 'Lightning fast — 1 minute each' },
  { id: 'blitz', label: 'Blitz', icon: Clock, time: '5+0', description: 'Fast paced — 5 minutes each' },
  { id: 'rapid', label: 'Rapid', icon: Target, time: '10+0', description: 'Balanced — 10 minutes each' },
  { id: 'classical', label: 'Classical', icon: Crown, time: '30+0', description: 'Deep analysis — 30 minutes each' },
]

export default function MatchmakingLobby() {
  const { user } = useAuthStore()
  const [selectedTime, setSelectedTime] = useState('blitz')
  const [searching, setSearching] = useState(false)
  const [dots, setDots] = useState('')
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!searching) return
    intervalRef.current = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'))
    }, 500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [searching])

  useEffect(() => {
    if (!searching) return
    pollingRef.current = setInterval(async () => {
      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeControl: selectedTime }),
      })
      const data = await res.json()
      if (data.status === 'matched') {
        setSearching(false)
        router.push(`/game/${data.gameId}?color=${data.color}`)
      }
    }, 2000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [searching, selectedTime, router])

  const startSearch = async () => {
    if (!user) { setShowAuthPrompt(true); return }
    setSearching(true)
  }

  const cancelSearch = async () => {
    setSearching(false)
    await fetch('/api/matchmaking', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeControl: selectedTime }),
    })
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      {/* Time control selector */}
      <div className="w-full">
        <p className="section-label mb-4 text-center">Choose Time Control</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TIME_CONTROLS.map((tc) => {
            const Icon = tc.icon
            const isActive = selectedTime === tc.id
            return (
              <button
                key={tc.id}
                onClick={() => setSelectedTime(tc.id)}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-[var(--primary)] bg-[var(--primary)]/8 dark:bg-[var(--primary)]/12 shadow-[0_4px_20px_rgba(37,99,235,0.15)]'
                    : 'card-surface hover:border-[var(--border-hover)]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm font-jost ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                    {tc.label}
                  </p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{tc.time}</p>
                </div>
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Player info card */}
      {user && (
        <div className="card-elevated flex items-center gap-4 w-full">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white flex-shrink-0"
            style={{ background: '#2563EB' }}
          >
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--text-primary)] truncate">{user.username}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Rating: <span className="text-[var(--primary)] font-semibold">{user.rating}</span>
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-[var(--text-muted)]">W / L / D</p>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
              {user.wins} / {user.losses} / {user.draws}
            </p>
          </div>
        </div>
      )}

      {/* Auth prompt */}
      {showAuthPrompt && (
        <div className="card-elevated w-full text-center !border-amber-200 dark:!border-amber-500/25 bg-amber-50/50 dark:bg-amber-500/[0.05]">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Sign in to play online</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Use the Sign Up button in the sidebar to create a free account.</p>
        </div>
      )}

      {/* Action buttons */}
      <AnimatePresence mode="wait">
        {searching ? (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-5 w-full"
          >
            <div className="card-elevated flex flex-col items-center gap-5 w-full !py-10 !border-[var(--primary)]/20">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-[var(--text-primary)] font-jost">
                  Finding opponent{dots}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1.5">
                  {TIME_CONTROLS.find(t => t.id === selectedTime)?.label} ·{' '}
                  Rating ±200 from {user?.rating ?? 1200}
                </p>
              </div>
            </div>
            <button
              onClick={cancelSearch}
              className="btn-secondary gap-2 !border-red-200 dark:!border-red-500/25 !text-red-600 dark:!text-red-400"
            >
              <X className="w-4 h-4" /> Cancel Search
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <button
              onClick={startSearch}
              className="btn-primary w-full !py-4 !text-sm !rounded-2xl gap-3"
            >
              <Swords className="w-5 h-5" />
              Find a Game
            </button>
            <button
              onClick={() => router.push('/play/local')}
              className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Users className="w-4 h-4" /> Play locally vs a friend
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
