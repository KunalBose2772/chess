'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import { Swords, Clock, Zap, Target, Crown, Loader2, X, Users } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

const TIME_CONTROLS = [
  { id: 'bullet', label: 'Bullet', icon: Zap, time: '1+0', description: 'Lightning fast — 1 minute each' },
  { id: 'blitz', label: 'Blitz', icon: Clock, time: '5+0', description: 'Fast paced — 5 minutes each' },
  { id: 'rapid', label: 'Rapid', icon: Target, time: '10+0', description: 'Balanced — 10 minutes each' },
  { id: 'classical', label: 'Classical', icon: Crown, time: '30+0', description: 'Deep analysis — 30 minutes each' },
]

function tap() {
  try {
    const a = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(300, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(120, a.currentTime + 0.1);
    g.gain.setValueAtTime(0.08, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.1);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.1);
  } catch {}
}

function MatchmakingLobbyContent() {
  const { user, setAuthModal } = useAuthStore()
  const searchParams = useSearchParams()
  const tcParam = searchParams?.get('tc')
  
  // Set initial time control from search param if valid, fallback to blitz
  const initialTime = tcParam && TIME_CONTROLS.some(t => t.id === tcParam) ? tcParam : 'blitz'
  
  const [selectedTime, setSelectedTime] = useState(initialTime)
  const [searching, setSearching] = useState(false)
  const [dots, setDots] = useState('')
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()

  // Sync state if query param changes
  useEffect(() => {
    if (tcParam && TIME_CONTROLS.some(t => t.id === tcParam)) {
      setSelectedTime(tcParam)
    }
  }, [tcParam])

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
      try {
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
      } catch (err) {
        console.error("Matchmaking error:", err)
      }
    }, 2000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [searching, selectedTime, router])

  const startSearch = async () => {
    tap()
    if (!user) { setAuthModal(true, 'signin'); return }
    setSearching(true)
  }

  const cancelSearch = async () => {
    tap()
    setSearching(false)
    try {
      await fetch('/api/matchmaking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeControl: selectedTime }),
      })
    } catch (err) {
      console.error("Cancel matchmaking error:", err)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      {/* Time control selector */}
      <div className="w-full">
        <p className="section-label mb-5 mx-auto block text-center">Choose Time Control</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TIME_CONTROLS.map((tc) => {
            const Icon = tc.icon
            const isActive = selectedTime === tc.id
            return (
              <button
                key={tc.id}
                onClick={() => { tap(); setSelectedTime(tc.id); }}
                className={`relative flex flex-col items-center gap-3 p-5 border-2 rounded-[var(--radius-sm)] transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-[var(--text-primary)] bg-[var(--primary)] text-white shadow-[3px_3px_0px_var(--text-primary)] -translate-y-0.5'
                    : 'border-[var(--text-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[3px_3px_0px_var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--text-primary)]'
                }`}
              >
                <div className={`w-10 h-10 rounded-sm border-2 border-[var(--text-primary)] flex items-center justify-center transition-colors ${
                  isActive ? 'bg-white text-[var(--primary)] shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.15)]' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={`font-black text-[13px] font-jost uppercase tracking-wider ${isActive ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                    {tc.label}
                  </p>
                  <p className={`text-[11px] font-bold mt-0.5 ${isActive ? 'text-[var(--bg-secondary)]/90' : 'text-[var(--text-muted)]'}`}>{tc.time}</p>
                </div>
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse border border-[var(--text-primary)]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Player info card */}
      {user && (
        <div className="bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] shadow-[4px_4px_0px_var(--text-primary)] flex items-center gap-4 w-full p-5">
          <div className="w-12 h-12 rounded-sm bg-[var(--primary)] border-2 border-[var(--text-primary)] shadow-[2px_2px_0px_var(--text-primary)] flex items-center justify-center font-black text-base text-white flex-shrink-0">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-[var(--text-primary)] text-sm truncate">{user.username}</p>
            <p className="text-xs text-[var(--text-muted)] font-bold mt-0.5">
              Rating: <span className="text-[var(--primary)] font-black">{user.rating}</span>
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">W / L / D</p>
            <p className="text-sm font-black text-[var(--text-primary)] mt-0.5">
              {user.wins} / {user.losses} / {user.draws}
            </p>
          </div>
        </div>
      )}

      {/* Auth prompt */}
      {!user && (
        <button
          onClick={() => { tap(); setAuthModal(true, 'signin'); }}
          className="bg-[var(--bg-secondary)] border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] shadow-[3px_3px_0px_var(--text-primary)] w-full p-5 text-center cursor-pointer hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--text-primary)] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--text-primary)] transition-all duration-200"
        >
          <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wide">Sign in to play online</p>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-1 font-montserrat">Click here to log in or create a free account.</p>
        </button>
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
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] shadow-[4px_4px_0px_var(--text-primary)] flex flex-col items-center gap-5 w-full !py-10">
              <div className="relative">
                <div className="w-16 h-16 rounded-sm bg-[var(--bg-secondary)] border-2 border-[var(--text-primary)] flex items-center justify-center shadow-[2px_2px_0px_var(--text-primary)]">
                  <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-[var(--text-primary)] font-jost uppercase tracking-wide">
                  Finding opponent{dots}
                </p>
                <p className="text-sm text-[var(--text-muted)] font-bold mt-1.5">
                  {TIME_CONTROLS.find(t => t.id === selectedTime)?.label} ·{' '}
                  Rating ±200 from {user?.rating ?? 1200}
                </p>
              </div>
            </div>
            <button
              onClick={cancelSearch}
              className="btn-secondary gap-2 !border-red-800 !text-red-700 hover:bg-red-50 cursor-pointer font-black"
            >
              <X className="w-4 h-4 stroke-[3]" /> Cancel Search
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
              className="btn-primary w-full !py-4 gap-3 cursor-pointer text-sm"
            >
              <Swords className="w-5 h-5" />
              Find a Game
            </button>
            <button
              onClick={() => { tap(); router.push('/play/local'); }}
              className="flex items-center gap-2 text-xs font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider cursor-pointer"
            >
              <Users className="w-4 h-4" /> Play locally vs a friend
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MatchmakingLobby() {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center py-10 font-bold text-[var(--text-muted)]">
        Loading lobby...
      </div>
    }>
      <MatchmakingLobbyContent />
    </Suspense>
  )
}
