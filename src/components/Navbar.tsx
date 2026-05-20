'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Crown, Swords, Trophy, Users, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, signOut } = useAuthStore()
  const [authOpen, setAuthOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState<'signin' | 'signup'>('signin')
  const [profileOpen, setProfileOpen] = useState(false)

  const openAuth = (tab: 'signin' | 'signup') => {
    setDefaultTab(tab)
    setAuthOpen(true)
  }

  return (
    <>
      <nav className="glass-panel sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-500 p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <span className="font-outfit font-bold text-2xl tracking-tight text-white">
            Chess<span className="text-indigo-400">Online</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-300">
          <Link href="/play" className="flex items-center gap-2 hover:text-white transition-colors">
            <Swords className="w-4 h-4" /> Play
          </Link>
          <Link href="/puzzles" className="flex items-center gap-2 hover:text-white transition-colors">
            <Trophy className="w-4 h-4" /> Puzzles
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-2 hover:text-white transition-colors">
            <Users className="w-4 h-4" /> Leaderboard
          </Link>
          <Link href="/learn" className="flex items-center gap-2 hover:text-white transition-colors">
            <Crown className="w-4 h-4" /> Learn
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 glass-panel px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm text-white">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-white">{user.username}</p>
                  <p className="text-xs text-indigo-300">⚡ {user.rating}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <Link
                    href={`/profile/${user.username}`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <button
                    onClick={() => { signOut(); setProfileOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuth('signin')}
                className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                <User className="w-4 h-4" /> Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={defaultTab} />
    </>
  )
}
