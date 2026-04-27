'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Subtle radial glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(92,115,182,0.1), transparent)' }} />
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-60" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[#0f0f0f]">
        <div className="flex items-center gap-2.5">
          <Image
            src="https://raw.githubusercontent.com/tryorigin/origin-stuffz/refs/heads/main/Untitled.png"
            alt="Origin"
            width={26}
            height={26}
            className="rounded-md"
            unoptimized
          />
          <span className="font-semibold text-[15px] tracking-tight">Origin</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://discord.gg/GnJSjfkYec"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#555] hover:text-white transition-colors"
          >
            Discord
          </a>
          <a
            href="https://getorigin.cc/legal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#555] hover:text-white transition-colors"
          >
            Legal
          </a>
          <Link
            href="/auth"
            className="btn btn-primary text-[13px] py-2 px-4"
          >
            Sign in →
          </Link>
        </div>
      </nav>

      {/* Hero — centered, full height */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Logo mark */}
          <div className="mb-8">
            <Image
              src="https://raw.githubusercontent.com/tryorigin/origin-stuffz/refs/heads/main/Untitled.png"
              alt="Origin Logo"
              width={56}
              height={56}
              className="rounded-xl"
              unoptimized
            />
          </div>

          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] mb-7 text-[12px] text-[#666]">
            <div className="status-dot" />
            All systems operational
          </div>

          {/* Headline */}
          <h1 className="text-[52px] leading-[1.06] font-semibold tracking-[-0.03em] mb-4 max-w-xl">
            Welcome to{' '}
            <span style={{
              background: 'linear-gradient(135deg, #7a90cc, #5c73b6, #8b9fd4)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 4s linear infinite',
            }}>
              Origin
            </span>
          </h1>

          <p className="text-[16px] text-[#555] max-w-sm mx-auto mb-10 leading-relaxed">
            Sign in with Discord to access your dashboard, scripts, and account settings.
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Link
              href="/auth"
              className="btn text-[14px] px-7 py-3 font-medium text-white inline-flex items-center gap-2.5"
              style={{ background: '#5865F2', border: 'none' }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.019.01.036.025.047a19.904 19.904 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Continue with Discord
            </Link>
          </motion.div>

          <p className="text-[12px] text-[#333] mt-5">
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
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#0f0f0f] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="https://raw.githubusercontent.com/tryorigin/origin-stuffz/refs/heads/main/Untitled.png"
            alt="Origin"
            width={16}
            height={16}
            className="rounded opacity-40"
            unoptimized
          />
          <span className="text-[12px] text-[#2a2a2a]">© 2026 Origin.</span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="https://getorigin.cc/legal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#2a2a2a] hover:text-[#666] transition-colors"
          >
            Terms &amp; Privacy
          </a>
          <a
            href="https://discord.gg/GnJSjfkYec"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#2a2a2a] hover:text-[#666] transition-colors"
          >
            Discord
          </a>
        </div>
      </footer>
    </main>
  )
}
