import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/auth/signup
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { email, password, username } = await request.json()

  if (!email || !password || !username) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ user: data.user })
}
