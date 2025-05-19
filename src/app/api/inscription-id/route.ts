import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  'https://amikskoyjbqdvvohgssv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI'

)

export async function GET() {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    return NextResponse.json({ error: 'Erreur récupération utilisateurs' }, { status: 500 })
  }

  const existing = users?.users
    .map((u) => u.user_metadata?.display_name)
    .filter(Boolean)

  let uid
  do {
    uid = Math.floor(100000 + Math.random() * 900000).toString()
  } while (existing.includes(uid))

  return NextResponse.json({ uid })
}