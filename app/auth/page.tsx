'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const ERROR_MESSAGES: Record<string, string> = {
  no_discord: 'Could not retrieve your Discord account.',
  not_registered: 'Your Discord account is not registered. Contact support.',
  banned: 'Your account has been suspended. Contact support.',
}

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const params = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const err = params.get('error')
    if (err) setError(ERROR_MESSAGES[err] || 'An unexpected error occurred.')
  }, [params])

  const handleDiscordLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'identify',
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 grid-bg opacity-60 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(92,115,182,0.08), transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm px-4"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-9">
          <Image
            src="https://raw.githubusercontent.com/tryorigin/origin-stuffz/refs/heads/main/Untitled.png"
            alt="Origin"
            width={30}
            height={30}
            className="rounded-lg"
            unoptimized
          />
          <span className="font-semibold text-[17px] tracking-tight">Origin</span>
        </div>

        {/* Card */}
        <div className="card" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.7)' }}>
          <h1 className="text-[19px] font-semibold tracking-tight mb-1">Sign in</h1>
          <p className="text-[13px] text-[#555] mb-7">
            Connect your Discord to access the dashboard.
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-[13px] flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            onClick={handleDiscordLogin}
            disabled={loading}
            className="btn w-full py-3 text-[14px] font-medium text-white"
            style={{
              background: loading ? '#1a1a1a' : '#5865F2',
              border: 'none',
            }}
          >
            {loading ? (
              <span className="text-[#666]">Connecting...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.019.01.036.025.047a19.904 19.904 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
                Continue with Discord
              </>
            )}
          </button>

          <div className="divider" />

          <p className="text-center text-[12px] text-[#444]">
            Don&apos;t have access?{' '}
            <a
              href="https://discord.gg/GnJSjfkYec"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5c73b6] hover:text-white transition-colors"
            >
              Join our Discord
            </a>
          </p>
        </div>

        <p className="text-center text-[12px] text-[#2a2a2a] mt-6">
          <Link href="/" className="hover:text-[#555] transition-colors">← Back</Link>
        </p>
      </motion.div>
    </main>
  )
}
