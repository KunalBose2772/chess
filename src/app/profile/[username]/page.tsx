import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Trophy, Target, Star, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Metadata } from 'next'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username}'s Profile - ChessOnline`,
    description: `View ${username}'s chess stats, rating, and game history.`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: recentGames } = await supabase
    .from('games')
    .select(`
      id, result, status, time_control, created_at,
      white_profile:profiles!games_white_id_fkey(username, rating),
      black_profile:profiles!games_black_id_fkey(username, rating)
    `)
    .or(`white_id.eq.${profile.id},black_id.eq.${profile.id}`)
    .eq('status', 'ended')
    .order('created_at', { ascending: false })
    .limit(10)

  const winPct = profile.games_played > 0
    ? Math.round((profile.wins / profile.games_played) * 100)
    : 0

  const STATS = [
    { label: 'Rating', value: profile.rating, icon: <Star className="w-5 h-5 text-amber-400" /> },
    { label: 'Games', value: profile.games_played, icon: <Clock className="w-5 h-5 text-blue-400" /> },
    { label: 'Wins', value: profile.wins, icon: <TrendingUp className="w-5 h-5 text-emerald-400" /> },
    { label: 'Losses', value: profile.losses, icon: <TrendingDown className="w-5 h-5 text-red-400" /> },
    { label: 'Draws', value: profile.draws, icon: <Minus className="w-5 h-5 text-slate-400" /> },
    { label: 'Win Rate', value: `${winPct}%`, icon: <Target className="w-5 h-5 text-purple-400" /> },
  ]

  return (
    <div className="flex flex-col flex-1 w-full px-6 py-12 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col gap-8">
        {/* Header */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex items-center gap-6">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center font-black text-4xl text-white shadow-xl"
            style={{ background: `hsl(${profile.username.charCodeAt(0) * 7 % 360}, 60%, 40%)` }}
          >
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-4xl font-bold font-outfit text-white">{profile.username}</h1>
            <p className="text-slate-400 mt-1">Member since {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 rounded-lg">
              <Trophy className="w-4 h-4 text-indigo-400" />
              <span className="text-indigo-300 font-bold text-sm">⚡ {profile.rating} Elo</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col items-center gap-2 text-center">
              {stat.icon}
              <p className="text-2xl font-bold text-white font-outfit">{stat.value}</p>
              <p className="text-slate-500 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent games */}
        <div>
          <h2 className="text-2xl font-bold font-outfit text-white mb-4">Recent Games</h2>
          {!recentGames || recentGames.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl border border-white/5 text-center">
              <p className="text-slate-400">No completed games yet.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
              {recentGames.map((g: any) => {
                const wp = Array.isArray(g.white_profile) ? g.white_profile[0] : g.white_profile
                const bp = Array.isArray(g.black_profile) ? g.black_profile[0] : g.black_profile
                const isWhite = wp?.username === username
                const myResult = !g.result
                  ? null
                  : g.result === '1/2-1/2'
                  ? 'draw'
                  : (g.result === '1-0' && isWhite) || (g.result === '0-1' && !isWhite)
                  ? 'win'
                  : 'loss'

                return (
                  <div key={g.id} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <div className={`w-14 py-1 rounded-lg text-center text-xs font-bold ${
                      myResult === 'win' ? 'bg-emerald-500/20 text-emerald-300' :
                      myResult === 'loss' ? 'bg-red-500/20 text-red-300' :
                      'bg-white/10 text-slate-300'
                    }`}>
                      {myResult === 'win' ? 'WIN' : myResult === 'loss' ? 'LOSS' : 'DRAW'}
                    </div>
                    <div className="flex-1 text-sm">
                      <span className="text-white font-semibold">{wp?.username}</span>
                      <span className="text-slate-500 mx-2">vs</span>
                      <span className="text-white font-semibold">{bp?.username}</span>
                    </div>
                    <span className="text-slate-500 text-xs capitalize">{g.time_control}</span>
                    <span className="text-slate-600 text-xs">{g.result ?? '–'}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
