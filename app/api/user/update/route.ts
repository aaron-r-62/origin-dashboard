import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminClient, canUpdate } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

const ALLOWED_FIELDS = ['username', 'password', 'hwid', 'webhook_url', 'performance_mode']
const COOLDOWN_FIELDS = ['username', 'password', 'hwid']
const COOLDOWN_TIMESTAMP_MAP: Record<string, string> = {
  username: 'username_updated_at',
  password: 'password_updated_at',
  hwid: 'hwid_updated_at',
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { field, value } = await request.json()
    if (!field || !ALLOWED_FIELDS.includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
    }

    // Get discord_id
    const discordId = session.user.identities?.find((i: any) => i.provider === 'discord')?.identity_data?.provider_id
      || session.user.user_metadata?.provider_id

    const admin = createAdminClient()

    // Fetch current user
    const { data: dbUser } = await admin
      .from('users')
      .select('*')
      .eq('discord_id', discordId)
      .single()

    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check cooldown for sensitive fields
    if (COOLDOWN_FIELDS.includes(field)) {
      const tsField = COOLDOWN_TIMESTAMP_MAP[field]
      const { allowed, hoursLeft } = canUpdate(dbUser[tsField])
      if (!allowed) {
        return NextResponse.json(
          { error: `This field was recently updated. Try again in ${hoursLeft} hours.` },
          { status: 429 }
        )
      }
    }

    // Build update payload
    const updatePayload: Record<string, any> = {}

    if (field === 'password') {
      if (!value || value.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
      }
      updatePayload['password_hash'] = await bcrypt.hash(value, 12)
      updatePayload['password_updated_at'] = new Date().toISOString()
    } else if (field === 'username') {
      if (!value || value.length < 3 || value.length > 24) {
        return NextResponse.json({ error: 'Username must be 3-24 characters' }, { status: 400 })
      }
      // Check uniqueness
      const { data: existing } = await admin
        .from('users')
        .select('id')
        .eq('username', value)
        .neq('id', dbUser.id)
        .single()
      if (existing) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
      updatePayload['username'] = value
      updatePayload['username_updated_at'] = new Date().toISOString()
    } else if (field === 'hwid') {
      updatePayload['hwid'] = value
      updatePayload['hwid_updated_at'] = new Date().toISOString()
    } else if (field === 'webhook_url') {
      if (value && !value.startsWith('https://discord.com/api/webhooks/')) {
        return NextResponse.json({ error: 'Invalid Discord webhook URL' }, { status: 400 })
      }
      updatePayload['webhook_url'] = value
    } else if (field === 'performance_mode') {
      updatePayload['performance_mode'] = Boolean(value)
    }

    const { error } = await admin
      .from('users')
      .update(updatePayload)
      .eq('id', dbUser.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
