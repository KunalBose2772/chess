'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import { Swords, Clock, Zap, Target, Crown, Loader2, X, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

const TIME_CONTROLS = [
  { id: 'bullet', label: 'Bullet', icon: <Zap className="w-6 h-6" />, time: '1+0', color: 'from-red-500 to-orange-500' },
  { id: 'blitz', label: 'Blitz', icon: <Clock className="w-6 h-6" />, time: '5+0', color: 'from-indigo-500 to-purple-500' },
  { id: 'rapid', label: 'Rapid', icon: <Target className="w-6 h-6" />, time: '10+0', color: 'from-emerald-500 to-teal-500' },
  { id: 'classical', label: 'Classical', icon: <Crown className="w-6 h-6" />, time: '30+0', color: 'from-amber-500 to-yellow-500' },
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

  // Animated dots while searching
  useEffect(() => {
    if (!searching) return
    intervalRef.current = setInterval(() => {
      setDots(d => (d.length >= 3 ? '' : d + '.'))
    }, 500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [searching])

  // Poll matchmaking endpoint
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
    if (!user) {
      setShowAuthPrompt(true)
      return
    }
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
    <div className="flex flex-col items-center gap-10 w-full max-w-2xl mx-auto py-8">
      {/* Time control selector */}
      <div className="w-full">
        <h2 className="text-xl font-bold font-outfit text-white mb-4 text-center">
          Choose Time Control
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TIME_CONTROLS.map((tc) => (
            <button
              key={tc.id}
              onClick={() => setSelectedTime(tc.id)}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-200 ${
                selectedTime === tc.id
                  ? 'border-indigo-500 bg-indigo-500/20 scale-[1.03] shadow-lg shadow-indigo-500/20'
                  : 'border-white/10 glass-panel hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${tc.color} text-white`}>
                {tc.icon}
              </div>
              <div>
                <p className="font-bold text-white font-outfit">{tc.label}</p>
                <p className="text-slate-400 text-sm">{tc.time}</p>
              </div>
              {selectedTime === tc.id && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-indigo-400 rounded-full animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Player info */}
      {user && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4 w-full">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg text-white">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-white">{user.username}</p>
            <p className="text-slate-400 text-sm">Rating: <span className="text-indigo-400 font-semibold">{user.rating}</span></p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-slate-400 text-xs">W/L/D</p>
            <p className="text-white font-semibold">{user.wins}/{user.losses}/{user.draws}</p>
          </div>
        </div>
      )}

      {/* Action button */}
      <AnimatePresence mode="wait">
        {searching ? (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-5 w-full"
          >
            <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 flex flex-col items-center gap-4 w-full shadow-[0_0_40px_rgba(99,102,241,0.15)]">
              <div className="relative">
                <Loader2 className="w-14 h-14 text-indigo-400 animate-spin" />
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white font-outfit">
                  Finding opponent{dots}
                </p>
                <p className="text-slate-400 mt-1">
                  {TIME_CONTROLS.find(t => t.id === selectedTime)?.label} •{' '}
                  Rating range: {user ? `${user.rating - 200}–${user.rating + 200}` : '1000–1400'}
                </p>
              </div>
            </div>
            <button
              onClick={cancelSearch}
              className="flex items-center gap-2 px-6 py-3 glass-panel border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/10 transition-colors font-semibold"
            >
              <X className="w-4 h-4" /> Cancel Search
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            <button
              onClick={startSearch}
              className="group relative w-full py-5 bg-white text-black rounded-2xl font-bold text-xl font-outfit overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Swords className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Find a Game
              </span>
            </button>
            <button
              onClick={() => router.push('/play/local')}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <Users className="w-4 h-4" /> Play locally vs a friend
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth prompt */}
      {showAuthPrompt && (
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 text-center w-full">
          <p className="text-amber-300 font-semibold">You need to sign in to play online.</p>
          <p className="text-slate-400 text-sm mt-1">
            Use the <strong>Sign Up</strong> button in the top-right to create a free account.
          </p>
        </div>
      )}
    </div>
  )
}
