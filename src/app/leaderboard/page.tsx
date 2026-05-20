import { createClient } from '@/lib/supabase/server'
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard - ChessOnline',
  description: 'Top rated chess players on ChessOnline ranked by Elo rating.',
}

interface Profile {
  username: string
  rating: number
  games_played: number
  wins: number
  losses: number
  draws: number
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: players } = await supabase
    .from('profiles')
    .select('username, rating, games_played, wins, losses, draws')
    .order('rating', { ascending: false })
    .limit(50)

  const topPlayers: Profile[] = players ?? []

  const rankBadge = (i: number) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }

  return (
    <div className="flex flex-col flex-1 w-full px-6 py-12 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col gap-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass-panel border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            <Trophy className="w-4 h-4" /> Top 50 Players
          </div>
          <h1 className="text-5xl font-bold font-outfit text-white">
            Leaderboard
          </h1>
          <p className="text-slate-400 mt-3">Ranked by Elo rating. Updated after every game.</p>
        </div>

        {topPlayers.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center">
            <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No players yet. Be the first to play!</p>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-x-4 px-6 py-4 border-b border-white/5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Games</span>
              <span className="text-right">W/L/D</span>
              <span className="text-right">Win%</span>
            </div>
            {topPlayers.map((player, i) => {
              const winPct = player.games_played > 0
                ? Math.round((player.wins / player.games_played) * 100)
                : 0
              return (
                <div
                  key={player.username}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-x-4 px-6 py-4 border-b border-white/5 last:border-0 items-center transition-colors hover:bg-white/5 ${
                    i < 3 ? 'bg-gradient-to-r from-white/[0.03] to-transparent' : ''
                  }`}
                >
                  <span className="text-lg font-bold w-8">{rankBadge(i)}</span>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                      style={{
                        background: `hsl(${(i * 47 + 220) % 360}, 60%, 45%)`,
                      }}
                    >
                      {player.username[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-white">{player.username}</span>
                  </div>
                  <span className="text-right font-bold text-indigo-400 tabular-nums">{player.rating}</span>
                  <span className="text-right text-slate-400 tabular-nums">{player.games_played}</span>
                  <div className="text-right text-xs font-medium tabular-nums">
                    <span className="text-emerald-400">{player.wins}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-red-400">{player.losses}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-400">{player.draws}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${
                      winPct >= 60 ? 'text-emerald-400' : winPct >= 40 ? 'text-slate-300' : 'text-red-400'
                    }`}>
                      {winPct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
