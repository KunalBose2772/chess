import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enqueue, dequeue, TimeControl } from '@/lib/matchmaker'

/**
 * POST /api/matchmaking
 * Body: { timeControl: 'bullet' | 'blitz' | 'rapid' | 'classical' }
 * 
 * Implements the matchmaking design from the documentation:
 * - Rating-based pairing (within ±200 Elo)
 * - Creates game row in Postgres once match is found
 * - Returns { status: 'queued' } or { status: 'matched', gameId }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { timeControl = 'blitz' }: { timeControl: TimeControl } = await request.json()

  // Fetch user's profile for rating
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, rating')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return Response.json({ error: 'Profile not found' }, { status: 404 })
  }

  const myEntry = {
    userId: user.id,
    username: profile.username,
    rating: profile.rating,
    timeControl,
    enqueuedAt: Date.now(),
  }

  const opponent = enqueue(myEntry)

  if (opponent) {
    // Match found — create game in Postgres
    // Randomly assign colors
    const whiteSide = Math.random() < 0.5 ? user.id : opponent.userId
    const blackSide = whiteSide === user.id ? opponent.userId : user.id

    const { data: game, error } = await supabase
      .from('games')
      .insert({
        white_id: whiteSide,
        black_id: blackSide,
        status: 'active',
        time_control: timeControl,
      })
      .select('id')
      .single()

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ status: 'matched', gameId: game.id, color: whiteSide === user.id ? 'white' : 'black' })
  }

  return Response.json({ status: 'queued' })
}

/**
 * DELETE /api/matchmaking
 * Cancel search
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { timeControl = 'blitz' } = await request.json()
  dequeue(user.id, timeControl)
  return Response.json({ status: 'dequeued' })
}
