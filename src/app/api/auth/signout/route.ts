import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/auth/signout
export async function POST(_request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return Response.json({ success: true })
}
