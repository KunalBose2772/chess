'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Crown, Swords, Trophy, Users, User, LogOut, ChevronDown, Tv, Globe, Menu, X, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import AuthModal from './AuthModal'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { user, signOut, authModalOpen, authModalTab, setAuthModal } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false)
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const openAuth = (tab: 'signin' | 'signup') => {
    setAuthModal(true, tab)
  }

  const navItems = [
    { name: 'Play', href: '/play', icon: Swords },
    { name: 'Puzzles', href: '/puzzles', icon: Trophy },
    { name: 'Learn', href: '/learn', icon: Crown },
    { name: 'Watch', href: '/watch', icon: Tv },
    { name: 'Community', href: '/community', icon: Globe },
    { name: 'Leaderboard', href: '/leaderboard', icon: Users },
  ]

  return (
    <>
      {/* ── MOBILE HEADER ──────────────────────────────────────────────── */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b-2 border-[var(--text-primary)] bg-[var(--bg-main)] shrink-0 relative z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 border-2 border-[var(--text-primary)]/15 hover:bg-[var(--bg-secondary)] hover:border-[var(--text-primary)] rounded-[var(--radius-sm)] transition-all duration-200"
          >
            <Menu className="w-6 h-6 text-[var(--text-primary)]" />
          </button>
          <Link href="/">
            <img src="/images/logo-dark.png" alt="ChessOnline Logo" className="h-[32px] w-auto" />
          </Link>
        </div>
        <div>
          {!user ? (
            <button onClick={() => openAuth('signin')} className="btn-secondary px-4 py-2.5 text-[12px]">
              Log In
            </button>
          ) : (
            <button 
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-2 border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] shadow-[2px_2px_0_var(--text-primary)] font-bold text-[12px] transition-all hover:shadow-[3px_3px_0_var(--text-primary)]"
            >
              <div className="w-6 h-6 rounded-sm bg-[var(--primary)] text-white flex items-center justify-center text-[11px] font-black">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* ── DESKTOP & MOBILE SIDEBAR ─────────────────────────────────────── */}
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[var(--text-primary)]/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 h-screen w-[260px] min-w-[260px] max-w-[260px] shrink-0 flex flex-col bg-[var(--bg-main)] border-r-2 border-[var(--text-primary)] z-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:translate-x-0 lg:relative lg:inset-auto lg:h-auto ${
          isMobileMenuOpen ? 'translate-x-0 shadow-[20px_0_40px_rgba(30,27,24,0.1)]' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header (Logo) */}
        <div className="flex justify-between items-center px-6 py-5 h-auto shrink-0 border-b-2 border-[var(--text-primary)]">
          <Link href="/" className="transition-transform hover:scale-105 duration-300 w-full">
            <img src="/images/logo-dark.png" alt="ChessOnline Logo" className="w-full h-auto drop-shadow-sm" />
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="lg:hidden p-2 -mr-2 border-2 border-transparent hover:bg-[var(--bg-secondary)] hover:border-[var(--text-primary)] rounded-[var(--radius-sm)] transition-all duration-200"
          >
            <X className="w-5 h-5 text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5 w-full scrollbar-none">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] font-montserrat text-[13px] font-bold transition-all duration-200 w-full border-2 ${
                  isActive 
                    ? 'bg-[var(--primary)] border-[var(--primary)] shadow-[3px_3px_0_var(--text-primary)] text-white' 
                    : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--primary)] hover:border-[var(--primary)] hover:text-white hover:shadow-[2px_2px_0_var(--text-primary)]'
                }`}
              >
                <item.icon className={`w-[20px] h-[20px] flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-white'}`} strokeWidth={2} />
                <span className="leading-tight">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section (Premium CTA + Auth/Profile) */}
        <div className="px-3 pt-3 pb-4 flex flex-col gap-3 shrink-0 border-t-2 border-[var(--text-primary)] bg-[var(--bg-secondary)]/20 w-full overflow-hidden relative">
          
          {/* Premium Card */}
          <div className="p-3 rounded-[var(--radius-sm)] border-2 border-[var(--text-primary)] bg-[var(--bg-surface)] shadow-[3px_3px_0_var(--text-primary)] relative overflow-hidden group w-full min-w-0 transition-all hover:shadow-[4px_4px_0_var(--text-primary)] hover:-translate-y-0.5">
            <div className="absolute -right-4 -top-4 w-14 h-14 bg-[var(--primary)]/15 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
            <div className="flex items-center gap-2 mb-1.5 relative z-10">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
              <h4 className="font-jost font-black text-[13px] text-[var(--text-primary)] tracking-tight uppercase leading-none">Premium</h4>
            </div>
            <p className="text-[11px] font-medium text-[var(--text-muted)] leading-[1.4] mb-2.5 relative z-10 whitespace-normal break-words">
              Unlock unlimited puzzles and AI analysis.
            </p>
            <button className="w-full py-2 bg-[var(--primary)] text-white text-[11px] font-bold uppercase tracking-widest rounded-[var(--radius-sm)] border-2 border-[var(--text-primary)] shadow-[2px_2px_0_var(--text-primary)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_var(--text-primary)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none relative z-10">
              Upgrade
            </button>
          </div>

          {/* User Section */}
          {!user ? (
            <div className="flex flex-col gap-2 w-full">
              <button 
                onClick={() => openAuth('signin')} 
                className="w-full py-2.5 font-bold text-[12px] border-2 border-[var(--primary)] rounded-[var(--radius-sm)] transition-all bg-[var(--primary)]/10 hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] shadow-[2px_2px_0_var(--text-primary)] hover:shadow-[3px_3px_0_var(--text-primary)] uppercase tracking-wider"
              >
                Log In
              </button>
              <Link 
                href="/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary w-full py-2.5 text-[12px] text-center block"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="relative w-full">
              <button 
                onClick={() => setProfileOpen(!profileOpen)} 
                className={`w-full flex items-center justify-between p-3 rounded-[var(--radius-sm)] border-2 transition-all ${
                  profileOpen 
                    ? 'border-[var(--text-primary)] bg-[var(--bg-surface)] shadow-[3px_3px_0_var(--text-primary)]' 
                    : 'border-transparent hover:bg-[var(--bg-surface)] hover:border-[var(--text-primary)] hover:shadow-[3px_3px_0_var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-[38px] h-[38px] rounded-sm bg-[var(--primary)] border-2 border-[var(--text-primary)] flex items-center justify-center text-white font-black text-[15px] shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-bold text-[13px] leading-tight text-[var(--text-primary)] truncate w-full">{user.username}</span>
                    <span className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">Free Plan</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              <div 
                className={`absolute bottom-[calc(100%+8px)] left-0 right-0 bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] shadow-[4px_4px_0_var(--text-primary)] overflow-hidden transition-all duration-200 origin-bottom z-50 ${
                  profileOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
                }`}
              >
                <Link 
                  href={`/profile/${user.username}`}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3.5 text-[13px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors border-b-2 border-[var(--border-primary)]/15"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button 
                  onClick={() => { signOut(); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-3.5 text-[13px] font-bold text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModal(false)} defaultTab={authModalTab} />
    </>
  );
}
