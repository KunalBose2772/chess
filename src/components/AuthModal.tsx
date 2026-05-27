'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, X, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'signin' | 'signup'
}

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

export default function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { refreshProfile } = useAuthStore()
  const router = useRouter()

  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    tap()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      await refreshProfile()
      onClose()
    }
    setLoading(false)
  }

  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    tap()
    setLoading(true)
    setError(null)
    // Simulate Supabase OAuth / onboarding funnel trigger
    setTimeout(() => {
      setLoading(false)
      onClose()
      router.push('/register')
    }, 800)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border-2 border-[var(--text-primary)] outline-1 outline-[var(--text-primary)] outline-offset-4 shadow-[6px_6px_0px_var(--text-primary)] p-8 text-left z-10 overflow-hidden font-montserrat"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--primary-start)] via-[var(--accent)] to-[var(--primary-start)]" />

            {/* Close Button */}
            <button
              onClick={() => { tap(); onClose(); }}
              className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50 p-1.5 rounded-sm border-2 border-transparent hover:border-[var(--text-primary)] transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-6 mt-2">
              <div className="bg-[var(--primary)] p-2.5 rounded-sm border-2 border-[var(--text-primary)] shadow-[2px_2px_0px_var(--text-primary)] flex items-center justify-center">
                <Crown className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-black font-jost text-[var(--text-primary)] leading-tight uppercase tracking-tight">
                  Welcome back
                </h2>
                <p className="text-[var(--text-muted)] font-bold text-xs mt-0.5">
                  Sign in to play chess online
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 bg-[var(--bg-secondary)]/50 border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] p-1">
              {(['signin', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    tap()
                    if (t === 'signup') {
                      onClose()
                      router.push('/register')
                    } else {
                      setTab(t)
                      setError(null)
                      setSuccess(null)
                    }
                  }}
                  className={`flex-1 py-2 rounded-sm text-xs font-black transition-all uppercase tracking-wider cursor-pointer ${
                    t === 'signin'
                      ? 'bg-[var(--primary)] text-white border-2 border-[var(--text-primary)] shadow-[2px_2px_0px_rgba(0,0,0,0.15)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border-2 border-transparent'
                  }`}
                >
                  {t === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {/* Social Logins */}
            <div className="flex flex-col gap-2.5 mb-5">
              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                className="w-full py-3 bg-white border-2 border-[var(--text-primary)] rounded-sm text-xs font-black uppercase tracking-wider text-[var(--text-primary)] shadow-[2.5px_2.5px_0px_var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--text-primary)] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--text-primary)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.99 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.75 2.91C6.03 7.54 8.78 5.04 12 5.04z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z"/>
                  <path fill="#FBBC05" d="M5.14 14.86c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.39 7.13C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.87l3.75-3.01z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-3.22 0-5.97-2.5-6.86-5.43L1.39 15.96C3.37 19.85 7.35 23 12 23z"/>
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignIn('apple')}
                className="w-full py-3 bg-white border-2 border-[var(--text-primary)] rounded-sm text-xs font-black uppercase tracking-wider text-[var(--text-primary)] shadow-[2.5px_2.5px_0px_var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--text-primary)] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--text-primary)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.62.72-1.16 1.87-1.01 2.98 1.1.09 2.23-.55 2.94-1.43z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3.5 my-4">
              <div className="flex-1 h-[1.5px] bg-[var(--text-primary)]/10" />
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest font-mono">or email password</span>
              <div className="flex-1 h-[1.5px] bg-[var(--text-primary)]/10" />
            </div>

            {/* Notifications */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-sm bg-red-50 border-2 border-red-800 text-red-800 text-xs font-bold leading-normal">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 px-4 py-3 rounded-sm bg-emerald-50 border-2 border-emerald-800 text-emerald-800 text-xs font-bold leading-normal">
                {success}
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[var(--text-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]/40 rounded-sm text-sm focus:outline-none focus:bg-[var(--bg-elevated)] shadow-[2px_2px_0px_rgba(0,0,0,0.05)] focus:shadow-[2px_2px_0px_var(--text-primary)] transition-all font-bold"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3 bg-white border-2 border-[var(--text-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]/40 rounded-sm text-sm focus:outline-none focus:bg-[var(--bg-elevated)] shadow-[2px_2px_0px_rgba(0,0,0,0.05)] focus:shadow-[2px_2px_0px_var(--text-primary)] transition-all font-bold"
                />
                <button
                  type="button"
                  onClick={() => { tap(); setShowPassword(!showPassword); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 mt-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
