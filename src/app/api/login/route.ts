import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://amikskoyjbqdvvohgssv.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtaWtza295amJxZHZ2b2hnc3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkxNDMyMywiZXhwIjoyMDYxNDkwMzIzfQ.U61LP1XdvyvzV-VlNEPslMptZ_pAAyum4g5qONm2vlI'

// Client Supabase avec service_role (comme en Python)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

export async function POST(req: Request) {
  try {
    const { identifiant, password } = await req.json()

    // 1. Liste tous les utilisateurs
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers()
    if (listError || !userList) {
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 })
    }

    // 2. Recherche l’utilisateur via display_name
    const user = userList.users.find(
      (u) => String(u.user_metadata?.display_name) === String(identifiant)
    )

    if (!user || !user.email) {
      return NextResponse.json({ error: '❌ Aucun utilisateur trouvé avec cet identifiant.' }, { status: 404 })
    }

    // 3. Connexion avec email + mot de passe
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    })

    if (loginError || !loginData.user) {
      return NextResponse.json({ error: '❌ Échec de la connexion : identifiants incorrects' }, { status: 401 })
    }

    const connectedUser = loginData.user

    return NextResponse.json({
      message: '✅ Connexion réussie !',
      uid: connectedUser.id,
      display_name: connectedUser.user_metadata?.display_name ?? 'inconnu',
    })
  } catch (e: any) {
    console.error('Erreur API /api/login :', e)
    return NextResponse.json({ error: '❌ Erreur interne : ' + e.message }, { status: 500 })
  }
}
