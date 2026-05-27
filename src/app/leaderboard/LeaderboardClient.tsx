'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Search, ChevronUp, ChevronDown, Award, Users, SearchSlash } from 'lucide-react'

interface Profile {
  username: string
  rating: number
  games_played: number
  wins: number
  losses: number
  draws: number
  country?: string
}

const DEFAULT_COUNTRIES = ['USA', 'IND', 'RUS', 'CHN', 'FRA', 'NOR', 'GER', 'CAN', 'GBR', 'UKR']

export default function LeaderboardClient({ initialPlayers }: { initialPlayers: Profile[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'Rapid' | 'Blitz' | 'Bullet' | 'Puzzles'>('Rapid')
  
  // Fill missing country tags with unique seeds
  const players = initialPlayers.map((p, idx) => ({
    ...p,
    country: p.country || DEFAULT_COUNTRIES[idx % DEFAULT_COUNTRIES.length]
  }))

  // Filter players based on search
  const filteredPlayers = players.filter(p => 
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Top 3 for the animated podiums
  const topThree = filteredPlayers.slice(0, 3)
  const remainingPlayers = filteredPlayers.slice(3)

  const playTap = () => {
    try {
      const a = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = a.createOscillator(), g = a.createGain()
      o.type = 'sine'; o.frequency.setValueAtTime(320, a.currentTime)
      o.frequency.exponentialRampToValueAtTime(130, a.currentTime + 0.08)
      g.gain.setValueAtTime(0.08, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.08)
      o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 0.08)
    } catch {}
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-transparent font-montserrat min-h-screen">
      <div className="max-w-[1160px] w-full mx-auto px-6 py-8 flex flex-col gap-8 flex-1">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/8 border border-cyan-400/20 px-3 py-1 rounded-full self-start flex items-center gap-1.5">
              <Trophy className="w-3 h-3 fill-current" /> Rankings
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-jost tracking-tight mt-1">Global Leaderboard</h1>
            <p className="text-[12px] text-slate-500 max-w-xl">Challenge yourself against the elite. Ratings update instantly after every match.</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit shadow-md self-start md:self-auto">
            <Users className="w-4.5 h-4.5 text-blue-400" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold leading-none">Total Ranked</p>
              <p className="text-[14px] font-bold text-slate-200 mt-1">{players.length} Players</p>
            </div>
          </div>
        </div>

        {/* ── Interactive Filters + Search ──────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          {/* Format Selection */}
          <div className="flex flex-wrap gap-1.5">
            {(['Rapid', 'Blitz', 'Bullet', 'Puzzles'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => { playTap(); setActiveCategory(cat); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] hover:border-white/[0.15] focus:border-blue-500 focus:bg-slate-900/40 text-slate-200 text-xs font-semibold placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* ── Podiums Showcase ──────────────────────────── */}
        {filteredPlayers.length > 0 && searchQuery === '' && (
          <div className="grid grid-cols-3 items-end max-w-[640px] w-full mx-auto mt-6 px-4 gap-4">
            
            {/* 2nd Place */}
            {topThree[1] && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 border border-slate-300 flex items-center justify-center font-black text-white text-base shadow-lg shadow-slate-500/25 mb-3">
                  {topThree[1].username[0].toUpperCase()}
                  <span className="absolute -top-3 -right-2 bg-slate-400 text-slate-900 font-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] border-2 border-slate-900">2</span>
                </div>
                <div className="text-center w-full min-w-0 px-2 mb-2">
                  <p className="text-[12px] font-bold text-slate-300 truncate">{topThree[1].username}</p>
                  <p className="text-[10px] font-bold text-slate-500 font-mono mt-0.5">⚡ {topThree[1].rating}</p>
                </div>
                <div className="w-full h-24 rounded-t-2xl bg-gradient-to-t from-slate-400/5 via-slate-400/10 to-slate-400/25 border-t border-x border-slate-400/20 shadow-md flex items-center justify-center">
                  <Award className="w-6 h-6 text-slate-400/60" />
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border border-amber-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/30 mb-3">
                  {topThree[0].username[0].toUpperCase()}
                  <span className="absolute -top-3 -right-2 bg-amber-400 text-slate-900 font-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] border-2 border-slate-900">1</span>
                  <span className="absolute -top-7 text-lg select-none filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)]">👑</span>
                </div>
                <div className="text-center w-full min-w-0 px-2 mb-2">
                  <p className="text-[13px] font-black text-white truncate">{topThree[0].username}</p>
                  <p className="text-[11px] font-black text-amber-400 font-mono mt-0.5 animate-pulse">⚡ {topThree[0].rating}</p>
                </div>
                <div className="w-full h-32 rounded-t-2xl bg-gradient-to-t from-amber-500/5 via-amber-500/10 to-amber-500/25 border-t border-x border-amber-500/25 shadow-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1),transparent_70%)]" />
                  <Trophy className="w-8 h-8 text-amber-500/70 relative z-10" />
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 border border-orange-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-orange-500/25 mb-3">
                  {topThree[2].username[0].toUpperCase()}
                  <span className="absolute -top-3 -right-2 bg-orange-400 text-slate-900 font-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] border-2 border-slate-900">3</span>
                </div>
                <div className="text-center w-full min-w-0 px-2 mb-2">
                  <p className="text-[12px] font-bold text-slate-300 truncate">{topThree[2].username}</p>
                  <p className="text-[10px] font-bold text-slate-500 font-mono mt-0.5">⚡ {topThree[2].rating}</p>
                </div>
                <div className="w-full h-20 rounded-t-2xl bg-gradient-to-t from-orange-500/5 via-orange-500/10 to-orange-500/25 border-t border-x border-orange-500/20 shadow-md flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-500/60" />
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* ── Table / Rankings List ─────────────────────── */}
        {filteredPlayers.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.05] bg-white/[0.01] p-12 text-center flex flex-col items-center justify-center">
            <SearchSlash className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
            <p className="text-sm font-bold text-slate-300">No matching players found</p>
            <p className="text-xs text-slate-500 mt-1">Try refining your search keyword.</p>
          </div>
        ) : (
          <div className="rounded-3xl bg-white/[0.02] border border-white/[0.05] overflow-hidden shadow-lg">
            
            {/* Header row (uses precise grid mapping) */}
            <div className="grid grid-cols-[50px_1fr_90px_80px_110px_70px] items-center gap-4 px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
              <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-600 text-center">Rank</div>
              <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-600">Player</div>
              <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-600 text-right">Rating</div>
              <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-600 text-right font-medium">Games</div>
              <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-600 text-right">W / L / D</div>
              <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-600 text-right">Win%</div>
            </div>

            {/* List entries */}
            <div className="divide-y divide-white/[0.03]">
              {filteredPlayers.map((player, idx) => {
                const winPct = player.games_played > 0
                  ? Math.round((player.wins / player.games_played) * 100)
                  : 0
                const rankNum = idx + 1
                const avatarHue = (idx * 47 + 220) % 360

                return (
                  <div key={player.username} className="grid grid-cols-[50px_1fr_90px_80px_110px_70px] items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    
                    {/* Rank Number */}
                    <div className="text-center font-mono">
                      <span className={`text-[12px] font-black ${
                        rankNum === 1 ? 'text-amber-400' :
                        rankNum === 2 ? 'text-slate-300' :
                        rankNum === 3 ? 'text-orange-400' :
                        'text-slate-500'
                      }`}>
                        {rankNum}
                      </span>
                    </div>

                    {/* Profile avatar + Username */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0 border border-white/[0.05]"
                        style={{ background: `hsl(${avatarHue}, 55%, 42%)` }}
                      >
                        {player.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-600 bg-white/5 px-1.5 py-0.5 rounded font-mono tracking-wider flex-shrink-0">{player.country}</span>
                        <span className="text-[12px] font-bold text-slate-200 truncate">{player.username}</span>
                        {rankNum <= 3 && (
                          <span className="text-[8px] font-black uppercase bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-1.5 py-0.5 rounded flex items-center gap-1.5 flex-shrink-0 leading-none">
                            <span className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" /> Elite
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rating ELO */}
                    <div className="text-right">
                      <span className="text-[12px] font-bold text-blue-400 font-mono">⚡ {player.rating}</span>
                    </div>

                    {/* Games Count */}
                    <div className="text-right">
                      <span className="text-[12px] font-semibold text-slate-400 font-mono">{player.games_played}</span>
                    </div>

                    {/* W / L / D Stats */}
                    <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold font-mono">
                      <span className="text-emerald-400">{player.wins}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-red-400">{player.losses}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-slate-400">{player.draws}</span>
                    </div>

                    {/* Win Percent */}
                    <div className="text-right">
                      <span className={`text-[12px] font-bold font-mono ${
                        winPct >= 65 ? 'text-emerald-400' :
                        winPct >= 50 ? 'text-slate-300' :
                        'text-red-400'
                      }`}>
                        {winPct}%
                      </span>
                    </div>

                  </div>
                )
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
