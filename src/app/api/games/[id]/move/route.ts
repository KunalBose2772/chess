import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateElo } from '@/lib/elo'

/**
 * POST /api/games/[id]/move
 * Body: { san, fromSq, toSq, fenAfter, promotion?, moveNumber }
 * 
 * Persists a move in the `moves` table.
 * The Supabase Realtime broadcast happens automatically via DB change triggers.
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/games/[id]/move'>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const gameId = parseInt(id, 10)
  const body = await request.json()

  const { data: game } = await supabase
    .from('games')
    .select('white_id, black_id, status')
    .eq('id', gameId)
    .single()

  if (!game || game.status !== 'active') {
    return Response.json({ error: 'Game not found or not active' }, { status: 404 })
  }
  if (game.white_id !== user.id && game.black_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Persist move
  const { error } = await supabase.from('moves').insert({
    game_id: gameId,
    move_number: body.moveNumber,
    san: body.san,
    from_sq: body.fromSq,
    to_sq: body.toSq,
    promotion: body.promotion ?? null,
    fen_after: body.fenAfter,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Update current FEN on game row for late-joiners
  await supabase.from('games').update({ fen: body.fenAfter }).eq('id', gameId)

  return Response.json({ success: true })
}

/**
 * PATCH /api/games/[id]/move
 * Body: { result: '1-0' | '0-1' | '1/2-1/2' }
 * 
 * Ends game and updates Elo ratings as per the ELO section in the documentation.
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/games/[id]/move'>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const gameId = parseInt(id, 10)
  const { result }: { result: '1-0' | '0-1' | '1/2-1/2' } = await request.json()

  const { data: game } = await supabase
    .from('games')
    .select('white_id, black_id, status')
    .eq('id', gameId)
    .single()

  if (!game || game.status !== 'active') {
    return Response.json({ error: 'Game not found or not active' }, { status: 404 })
  }

  // Fetch ratings
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, rating, games_played, wins, losses, draws')
    .in('id', [game.white_id, game.black_id])

  const whiteProfile = profiles?.find(p => p.id === game.white_id)
  const blackProfile = profiles?.find(p => p.id === game.black_id)

  if (!whiteProfile || !blackProfile) {
    return Response.json({ error: 'Profiles not found' }, { status: 404 })
  }

  // Calculate new Elo ratings
  const newWhiteRating = calculateElo(whiteProfile.rating, blackProfile.rating, result, 'white')
  const newBlackRating = calculateElo(whiteProfile.rating, blackProfile.rating, result, 'black')

  // Update game status
  await supabase.from('games').update({
    status: 'ended',
    result,
    ended_at: new Date().toISOString(),
  }).eq('id', gameId)

  // Update white player stats
  await supabase.from('profiles').update({
    rating: newWhiteRating,
    games_played: whiteProfile.games_played + 1,
    wins: result === '1-0' ? whiteProfile.wins + 1 : whiteProfile.wins,
    losses: result === '0-1' ? whiteProfile.losses + 1 : whiteProfile.losses,
    draws: result === '1/2-1/2' ? whiteProfile.draws + 1 : whiteProfile.draws,
  }).eq('id', game.white_id)

  // Update black player stats
  await supabase.from('profiles').update({
    rating: newBlackRating,
    games_played: blackProfile.games_played + 1,
    wins: result === '0-1' ? blackProfile.wins + 1 : blackProfile.wins,
    losses: result === '1-0' ? blackProfile.losses + 1 : blackProfile.losses,
    draws: result === '1/2-1/2' ? blackProfile.draws + 1 : blackProfile.draws,
  }).eq('id', game.black_id)

  return Response.json({
    success: true,
    ratings: {
      white: { old: whiteProfile.rating, new: newWhiteRating },
      black: { old: blackProfile.rating, new: newBlackRating },
    },
  })
}
