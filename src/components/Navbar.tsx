'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Crown, Swords, Trophy, Users, User, LogOut, ChevronDown, Moon, Sun, Tv, Sparkles, ArrowRight, Globe } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import AuthModal from './AuthModal'
import { useTheme } from './ThemeProvider'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { user, signOut } = useAuthStore()
  const [authOpen, setAuthOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState<'signin' | 'signup'>('signin')
  const [profileOpen, setProfileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const openAuth = (tab: 'signin' | 'signup') => {
    setDefaultTab(tab)
    setAuthOpen(true)
  }

  // Solid Colors active styling helper via highly robust static CSS classes
  const getLinkClass = (path: string) => {
    const isActive = pathname === path
    return `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
      isActive 
        ? 'sidebar-link-active' 
        : 'hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
    }`
  }

  return (
    <>
      <aside className="sticky top-0 z-40 h-screen w-[260px] flex flex-col justify-between p-6 glass-sidebar transition-all duration-500 font-montserrat">
        <div className="flex flex-col gap-10">
          
          {/* Logo beautifully wrapped in a premium brand background card */}
          <Link href="/" className="w-full flex items-center justify-center group pl-1">
            <div className="flex items-center justify-center px-4 py-3 rounded-xl logo-card-container w-full transition-all">
              {mounted && theme === 'light' ? (
                 <img src="/images/logo-light.png" alt="ChessOnline Logo" className="w-[160px] h-auto object-contain opacity-95 transition-opacity" />
              ) : (
                 <img src="/images/logo-dark.png" alt="ChessOnline Logo" className="w-[160px] h-auto object-contain opacity-95 transition-opacity" />
              )}
            </div>
          </Link>

          {/* Sidebar Menu items using elegant Solid Colors active styling */}
          <div className="flex flex-col gap-1 font-medium text-[13.5px] text-[var(--text-secondary)] tracking-wide">
            <Link href="/" className={getLinkClass('/')}>
              <Swords className="w-4 h-4" /> Play
            </Link>
            <Link href="/puzzles" className={getLinkClass('/puzzles')}>
              <Trophy className="w-4 h-4" /> Puzzles
            </Link>
            <Link href="/leaderboard" className={getLinkClass('/leaderboard')}>
              <Users className="w-4 h-4" /> Leaderboard
            </Link>
            <Link href="/learn" className={getLinkClass('/learn')}>
              <Crown className="w-4 h-4" /> Learn
            </Link>
            <Link href="/watch" className={getLinkClass('/watch')}>
              <Tv className="w-4 h-4" /> Watch
            </Link>
            <Link href="/community" className={getLinkClass('/community')}>
              <Users className="w-4 h-4" /> Community
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Go Premium Card */}
          <div className="p-4 rounded-xl premium-card-gold flex flex-col gap-2 relative group overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-[var(--text-primary)]">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
                Go Premium
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-500/10 dark:bg-white/5 hover:bg-blue-500/20 dark:hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer">
                <ArrowRight className="w-3 h-3 text-blue-600 dark:text-[var(--text-secondary)]" />
              </div>
            </div>
            <p className="text-[10px] text-blue-700/80 dark:text-[var(--text-muted)] leading-normal font-light">
              Unlock unlimited puzzles, advanced analytics, and more.
            </p>
          </div>

          {/* Quiet Auth Buttons (Inside Sidebar for logged-out players) */}
          {!user && (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => openAuth('signup')}
                className="quiet-primary-btn w-full px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide flex justify-center items-center cursor-pointer"
              >
                Sign Up
              </button>
              <button
                onClick={() => openAuth('signin')}
                className="quiet-secondary-btn w-full px-4 py-2.5 rounded-xl text-xs font-medium tracking-wide flex justify-center items-center cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-full flex items-center justify-between glass-panel px-4 py-2.5 rounded-xl hover:border-[var(--border-hover)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center font-bold text-xs text-[#FFFFFF]">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[90px]">{user.username}</p>
                    <p className="text-[10px] text-[var(--accent)]">⚡ {user.rating}</p>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-full glass-panel rounded-xl overflow-hidden z-50 shadow-[var(--soft-shadow)]">
                  <Link
                    href={`/profile/${user.username}`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <User className="w-3.5 h-3.5" /> My Profile
                  </Link>
                  <button
                    onClick={() => { signOut(); setProfileOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bottom Row: Players Online, Language Selector, and Icon-only Theme Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            {/* Players online */}
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-light text-[var(--text-muted)] tracking-wider">100K Live</span>
            </div>

            {/* Selector & Icon Toggle */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-[10px] font-light text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Globe className="w-3.5 h-3.5 opacity-80" />
                EN
              </button>
              <button 
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full border border-[var(--border-primary)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                 {mounted && theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={defaultTab} />
    </>
  )
}
