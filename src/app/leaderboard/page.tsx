import { createClient } from '@/lib/supabase/server'
import { Trophy } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Leaderboard — ChessOnline',
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

  const rankDisplay = (i: number) => {
    if (i === 0) return { emoji: '🥇', color: '#F59E0B' }
    if (i === 1) return { emoji: '🥈', color: '#94A3B8' }
    if (i === 2) return { emoji: '🥉', color: '#D97706' }
    return { emoji: `#${i + 1}`, color: 'var(--text-muted)' }
  }

  return (
    <div className="page-section">
      <div className="page-spot-tl" />
      <div className="page-spot-br" />

      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <span className="section-label flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" /> Rankings
          </span>
          <h1 className="page-heading">Leaderboard</h1>
          <p className="page-subheading">
            Top 50 players ranked by Elo rating. Updated live after every game.
          </p>
        </div>

        {topPlayers.length === 0 ? (
          <div className="card-elevated flex flex-col items-center gap-4 py-20 text-center">
            <Trophy className="w-10 h-10 text-[var(--text-muted)]" />
            <p className="page-subheading mx-auto">No players yet. Be the first to play!</p>
          </div>
        ) : (
          <div className="card-elevated !p-0 overflow-hidden">
            {/* Table Header */}
            <div className="table-header grid grid-cols-[2.5rem_1fr_6rem_5rem_7rem_5rem]">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Games</span>
              <span className="text-right">W / L / D</span>
              <span className="text-right">Win%</span>
            </div>

            {topPlayers.map((player, i) => {
              const winPct = player.games_played > 0
                ? Math.round((player.wins / player.games_played) * 100)
                : 0
              const rank = rankDisplay(i)
              const avatarHue = (i * 47 + 220) % 360

              return (
                <div
                  key={player.username}
                  className={`table-row grid grid-cols-[2.5rem_1fr_6rem_5rem_7rem_5rem] ${i < 3 ? 'bg-[var(--primary)]/[0.015]' : ''}`}
                >
                  {/* Rank */}
                  <span className="text-sm font-bold" style={{ color: rank.color }}>
                    {rank.emoji}
                  </span>

                  {/* Player */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                      style={{ background: `hsl(${avatarHue}, 55%, 48%)` }}
                    >
                      {player.username[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {player.username}
                    </span>
                    {i < 3 && <span className="badge hidden sm:inline-flex">Elite</span>}
                  </div>

                  {/* Rating */}
                  <span className="text-right font-bold text-[var(--primary)] tabular-nums text-sm">
                    {player.rating}
                  </span>

                  {/* Games */}
                  <span className="text-right text-[var(--text-muted)] tabular-nums text-sm">
                    {player.games_played}
                  </span>

                  {/* W/L/D */}
                  <div className="text-right text-xs font-semibold tabular-nums flex items-center justify-end gap-1">
                    <span className="text-emerald-600 dark:text-emerald-400">{player.wins}</span>
                    <span className="text-[var(--text-muted)]">/</span>
                    <span className="text-red-500 dark:text-red-400">{player.losses}</span>
                    <span className="text-[var(--text-muted)]">/</span>
                    <span className="text-[var(--text-muted)]">{player.draws}</span>
                  </div>

                  {/* Win% */}
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${
                      winPct >= 60 ? 'text-emerald-600 dark:text-emerald-400'
                      : winPct >= 40 ? 'text-[var(--text-secondary)]'
                      : 'text-red-500 dark:text-red-400'
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
