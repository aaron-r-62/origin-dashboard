import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import DashboardClient from './DashboardClient'
import type { User } from '@/lib/supabase'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth')

  // Get discord_id from OAuth identity
  const identities = session.user.identities || []
  const discordIdentity = identities.find((i: any) => i.provider === 'discord')
  const discordId = discordIdentity?.identity_data?.provider_id || 
                    session.user.user_metadata?.provider_id

  if (!discordId) redirect('/auth?error=no_discord')

  // Fetch user from public.users
  const admin = createAdminClient()
  const { data: dbUser } = await admin
    .from('users')
    .select('*')
    .eq('discord_id', discordId)
    .single()

  if (!dbUser) redirect('/auth?error=not_registered')
  if (dbUser.is_banned) redirect('/auth?error=banned')

  return <DashboardClient user={dbUser as User} />
}
