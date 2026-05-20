import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/auth/signin
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { email, password } = await request.json()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return Response.json({ error: error.message }, { status: 401 })
  }

  return Response.json({ user: data.user, session: data.session })
}
