'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Crown, Swords, Trophy, Users, User, LogOut, ChevronDown, Moon, Sun, Tv, Sparkles, ArrowRight, Globe, Bot, Lightbulb, BarChart2, Dices, History } from 'lucide-react'
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
  const [isPlayHovered, setIsPlayHovered] = useState(false)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const openAuth = (tab: 'signin' | 'signup') => {
    setDefaultTab(tab)
    setAuthOpen(true)
  }

  // Solid Colors active styling helper via highly robust static CSS classes
  const getLinkClass = (path: string) => {
    const isActive = path === '/' ? pathname === '/' : pathname?.startsWith(path)
    return `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
      isActive 
        ? 'sidebar-link-active' 
        : 'hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
    }`
  }

  return (
    <>
      <aside className="sticky top-0 z-[60] h-screen w-[260px] flex flex-col justify-between p-6 glass-sidebar transition-all duration-500 font-montserrat">
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
            <div 
              className="relative"
              onMouseEnter={() => setIsPlayHovered(true)}
              onMouseLeave={() => setIsPlayHovered(false)}
            >
              <Link href="/play" className={getLinkClass('/play')}>
                <Swords className="w-4 h-4" /> Play
              </Link>

              {/* Flyout Submenu Panel - Stretched and stuck flush to sidebar */}
              <div 
                className={`absolute left-[236px] top-[-12px] w-[270px] rounded-r-2xl rounded-l-none bg-[#080C16] p-3.5 z-[99] shadow-[10px_20px_50px_rgba(0,0,0,0.6)] border border-l-0 border-white/[0.08] transition-all duration-300 flex flex-col gap-1 before:content-[''] before:absolute before:left-[-40px] before:top-0 before:w-[40px] before:h-full before:bg-transparent ${
                  isPlayHovered 
                    ? 'opacity-100 translate-x-0 pointer-events-auto' 
                    : 'opacity-0 -translate-x-2 pointer-events-none'
                }`}
              >
                <div className="px-2 pb-2 mb-1 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">Arena Hub</span>
                  <span className="flex items-center gap-1 text-[9px] text-[var(--primary)] font-semibold uppercase animate-pulse">● Live</span>
                </div>
                
                <Link href="/play/online" className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                    <Globe className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Play Online</span>
                    <span className="text-[9px] text-[var(--text-muted)]">Real-time matchmaking ELO</span>
                  </div>
                </Link>

                <Link href="/play/bots" className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center transition-colors group-hover:bg-blue-500 group-hover:text-white">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Play Bots</span>
                    <span className="text-[9px] text-[var(--text-muted)]">Challenge unique AI characters</span>
                  </div>
                </Link>

                <Link href="/play/coach" className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center transition-colors group-hover:bg-amber-500 group-hover:text-white">
                    <Lightbulb className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Play Coach</span>
                    <span className="text-[9px] text-[var(--text-muted)]">Real-time dynamic AI guides</span>
                  </div>
                </Link>

                <Link href="/play/stats" className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center transition-colors group-hover:bg-purple-500 group-hover:text-white">
                    <BarChart2 className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Stats</span>
                    <span className="text-[9px] text-[var(--text-muted)]">Check ELO progress & accuracy</span>
                  </div>
                </Link>

                <Link href="/play/tournaments" className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center transition-colors group-hover:bg-red-500 group-hover:text-white">
                    <Trophy className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Tournaments</span>
                    <span className="text-[9px] text-[var(--text-muted)]">Swiss brackets and open arenas</span>
                  </div>
                </Link>

                <Link href="/play/variants" className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center transition-colors group-hover:bg-orange-500 group-hover:text-white">
                    <Dices className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Variants</span>
                    <span className="text-[9px] text-[var(--text-muted)]">Fischer Random & custom modes</span>
                  </div>
                </Link>

                <Link href="/play/history" className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-all group">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center transition-colors group-hover:bg-teal-500 group-hover:text-white">
                    <History className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Game History</span>
                    <span className="text-[9px] text-[var(--text-muted)]">Review and analyze past matches</span>
                  </div>
                </Link>
              </div>
            </div>
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

            {/* Language Selector */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-[10px] font-light text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Globe className="w-3.5 h-3.5 opacity-80" />
                EN
              </button>
            </div>
          </div>
        </div>
      </aside>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={defaultTab} />
    </>
  )
}
