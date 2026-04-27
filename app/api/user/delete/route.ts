import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const discordId = session.user.identities?.find((i: any) => i.provider === 'discord')?.identity_data?.provider_id
      || session.user.user_metadata?.provider_id

    const admin = createAdminClient()

    // Wipe user data (preserve account row, just clear sensitive fields)
    const { error } = await admin
      .from('users')
      .update({
        hwid: null,
        license_key: 'REVOKED-' + Date.now(),
        webhook_url: null,
        username: 'deleted_' + Date.now(),
      })
      .eq('discord_id', discordId)

    if (error) throw error

    // Sign out
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Delete failed' }, { status: 500 })
  }
}
