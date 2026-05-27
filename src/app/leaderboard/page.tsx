import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import LeaderboardClient from './LeaderboardClient'

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
  country?: string
}

const SEED_PLAYERS: Profile[] = [
  { username: 'GrandmasterAlex', rating: 2840, games_played: 1420, wins: 890, losses: 310, draws: 220, country: 'RUS' },
  { username: 'QueenGambitPro', rating: 2711, games_played: 980, wins: 610, losses: 230, draws: 140, country: 'CHN' },
  { username: 'TacticalNinja', rating: 2654, games_played: 1150, wins: 710, losses: 290, draws: 150, country: 'IND' },
  { username: 'HikaruFanatic', rating: 2590, games_played: 2100, wins: 1220, losses: 610, draws: 270, country: 'USA' },
  { username: 'ChessWhiz', rating: 2480, games_played: 850, wins: 490, losses: 210, draws: 150, country: 'FRA' },
  { username: 'MagnusDisciple', rating: 2420, games_played: 670, wins: 380, losses: 180, draws: 110, country: 'NOR' },
  { username: 'KunalBose2772', rating: 800, games_played: 1, wins: 1, losses: 0, draws: 0, country: 'IND' }
]

export default async function LeaderboardPage() {
  let topPlayers: Profile[] = []

  try {
    const supabase = await createClient()
    const { data: players } = await supabase
      .from('profiles')
      .select('username, rating, games_played, wins, losses, draws')
      .order('rating', { ascending: false })
      .limit(50)

    if (players && players.length > 0) {
      topPlayers = players
    } else {
      topPlayers = SEED_PLAYERS
    }
  } catch (error) {
    console.error('Supabase profile fetch failed, falling back to seed players.', error)
    topPlayers = SEED_PLAYERS
  }

  return <LeaderboardClient initialPlayers={topPlayers} />
}
