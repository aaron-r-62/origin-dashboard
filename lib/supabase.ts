// ─── SHARED: types and pure helpers ───────────────────────────────────────────
// Safe to import anywhere — no Next.js server-only APIs here.

import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export type Tier = 'og' | 'premium' | 'pro' | 'standard'

export interface User {
  id: string
  username: string
  password_hash: string
  hwid: string
  discord_id: string
  license_key: string
  tier: Tier
  is_banned: boolean
  created_at: string
  username_updated_at: string | null
  password_updated_at: string | null
  hwid_updated_at: string | null
  webhook_url: string | null
  performance_mode: boolean
}

/** Browser/client-side Supabase client. Safe to call in 'use client' components. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/** Service-role admin client. Only call from Server Components or API routes. */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export function getTierConfig(tier: Tier) {
  switch (tier) {
    case 'og':
      return {
        label: 'OG',
        color: 'transparent',
        gradient: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #a0a0a0, #d4d4d4, #888, #e0e0e0)',
        glowColor: 'rgba(192,192,192,0.15)',
        textClass: 'text-chrome',
        badgeClass: 'badge-og',
        accentColor: '#c0c0c0',
        shimmer: true,
      }
    case 'premium':
      return {
        label: 'Premium',
        color: '#a855f7',
        gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)',
        glowColor: 'rgba(168,85,247,0.15)',
        textClass: 'text-purple-400',
        badgeClass: 'badge-premium',
        accentColor: '#a855f7',
        shimmer: false,
      }
    case 'pro':
      return {
        label: 'Pro',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        glowColor: 'rgba(59,130,246,0.12)',
        textClass: 'text-blue-400',
        badgeClass: 'badge-pro',
        accentColor: '#3b82f6',
        shimmer: false,
      }
    default:
      return {
        label: 'Standard',
        color: '#ffffff',
        gradient: 'linear-gradient(135deg, #ffffff, #cccccc)',
        glowColor: 'rgba(255,255,255,0.06)',
        textClass: 'text-white',
        badgeClass: 'badge-standard',
        accentColor: '#ffffff',
        shimmer: false,
      }
  }
}

export function canUpdate(updatedAt: string | null): { allowed: boolean; hoursLeft: number } {
  if (!updatedAt) return { allowed: true, hoursLeft: 0 }
  const diff = Date.now() - new Date(updatedAt).getTime()
  const cooldown = 24 * 60 * 60 * 1000
  if (diff >= cooldown) return { allowed: true, hoursLeft: 0 }
  return { allowed: false, hoursLeft: Math.ceil((cooldown - diff) / 3_600_000) }
}
