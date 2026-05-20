'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GameBoard from '@/components/GameBoard'
import { Loader2, AlertCircle } from 'lucide-react'

interface GameData {
  id: number
  white_id: string
  black_id: string
  status: string
  fen: string
  white_profile: { username: string; rating: number }
  black_profile: { username: string; rating: number }
}

export default function GameClient({ gameId }: { gameId: number }) {
  const searchParams = useSearchParams()
  const colorParam = searchParams.get('color') as 'white' | 'black' | null
  const [game, setGame] = useState<GameData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')
  const supabase = createClient()

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          id, white_id, black_id, status, fen,
          white_profile:profiles!games_white_id_fkey(username, rating),
          black_profile:profiles!games_black_id_fkey(username, rating)
        `)
        .eq('id', gameId)
        .single()

      if (gameError || !gameData) {
        setError('Game not found.')
        setLoading(false)
        return
      }

      // Determine player color
      if (colorParam) {
        setPlayerColor(colorParam)
      } else if (user) {
        setPlayerColor(gameData.white_id === user.id ? 'white' : 'black')
      }

      setGame(gameData as unknown as GameData)
      setLoading(false)
    })()
  }, [gameId, colorParam, supabase])

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
          </div>
          <p className="text-sm text-[var(--text-muted)]">Loading game…</p>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="flex-1 h-full flex items-center justify-center p-6">
        <div className="card-elevated flex items-center gap-4 !border-red-200 dark:!border-red-500/25">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-[var(--text-primary)]">{error ?? 'Something went wrong.'}</p>
        </div>
      </div>
    )
  }

  const wp = Array.isArray(game.white_profile) ? game.white_profile[0] : game.white_profile
  const bp = Array.isArray(game.black_profile) ? game.black_profile[0] : game.black_profile

  return (
    <div className="flex-1 h-full flex flex-col min-h-0">
      <GameBoard
        gameId={game.id}
        playerColor={playerColor}
        whitePlayer={{ id: game.white_id, username: wp.username, rating: wp.rating }}
        blackPlayer={{ id: game.black_id, username: bp.username, rating: bp.rating }}
        initialFen={game.fen}
      />
    </div>
  )
}
