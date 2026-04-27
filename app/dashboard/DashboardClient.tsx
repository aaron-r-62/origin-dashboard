'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Code, Home, LogOut } from 'lucide-react'
import type { User as UserType } from '@/lib/supabase'
import { getTierConfig } from '@/lib/supabase'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import HomeTab from '@/components/dashboard/HomeTab'
import ScriptsTab from '@/components/dashboard/ScriptsTab'
import SettingsTab from '@/components/dashboard/SettingsTab'

type Tab = 'home' | 'scripts' | 'settings'
type Theme = 'obsidian' | 'midnight'

const THEME_BG: Record<Theme, string> = {
  obsidian: '#000000',
  midnight: '#05050f',
}
const THEME_SIDEBAR: Record<Theme, string> = {
  obsidian: '#010101',
  midnight: '#07070f',
}

const tabs = [
  { id: 'home' as Tab, label: 'Account', icon: Home },
  { id: 'scripts' as Tab, label: 'Scripts', icon: Code },
  { id: 'settings' as Tab, label: 'Settings', icon: Settings },
]

export default function DashboardClient({ user }: { user: UserType }) {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [userData, setUserData] = useState(user)
  const [theme, setTheme] = useState<Theme>('obsidian')
  const [perfMode, setPerfMode] = useState(user.performance_mode || false)
  const tierConfig = getTierConfig(user.tier)
  const router = useRouter()
  const supabase = createClient()

  // Apply theme background to document
  useEffect(() => {
    document.body.style.background = THEME_BG[theme]
  }, [theme])

  // Apply / remove performance mode — this is what actually disables animations
  useEffect(() => {
    if (perfMode) {
      document.documentElement.classList.add('perf-mode')
    } else {
      document.documentElement.classList.remove('perf-mode')
    }
  }, [perfMode])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handlePerfModeChange = (val: boolean) => {
    setPerfMode(val)
    setUserData(u => ({ ...u, performance_mode: val }))
  }

  return (
    <div className="min-h-screen flex" style={{ background: THEME_BG[theme] }}>
      {/* Premium nebula glows — suppressed in perf mode */}
      {userData.tier === 'premium' && !perfMode && (
        <>
          <div className="nebula-bg fixed pointer-events-none" style={{ width: 500, height: 500, top: -100, left: -100, background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />
          <div className="nebula-bg fixed pointer-events-none" style={{ width: 400, height: 400, bottom: -50, right: -50, background: 'radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)', animationDelay: '3s' }} />
        </>
      )}
      {userData.tier === 'og' && !perfMode && (
        <div className="fixed pointer-events-none inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(192,192,192,0.04), transparent)' }} />
      )}

      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col border-r border-[#111] h-screen sticky top-0"
        style={{ background: THEME_SIDEBAR[theme] }}
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[#111]">
          <div className="flex items-center gap-2.5">
            <Image
              src="https://raw.githubusercontent.com/tryorigin/origin-stuffz/refs/heads/main/Untitled.png"
              alt="Origin"
              width={26}
              height={26}
              className="rounded-md flex-shrink-0"
              unoptimized
            />
            <span className="font-semibold text-[14px] tracking-tight">Origin</span>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-[#111]">
          <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #161616' }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold"
                style={{ background: tierConfig.gradient }}
              >
                {userData.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{userData.username}</div>
                <TierBadge tier={user.tier} />
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150"
              style={
                activeTab === tab.id
                  ? { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #1a1a1a' }
                  : { color: '#555', border: '1px solid transparent' }
              }
            >
              <tab.icon size={14} style={{ color: activeTab === tab.id ? tierConfig.accentColor : undefined }} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#555] hover:text-[#ef4444] hover:bg-red-950/10 transition-all"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={perfMode ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={perfMode ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && (
                <HomeTab user={userData} onUserUpdate={setUserData} tierConfig={tierConfig} />
              )}
              {activeTab === 'scripts' && (
                <ScriptsTab user={userData} tierConfig={tierConfig} />
              )}
              {activeTab === 'settings' && (
                <SettingsTab
                  user={userData}
                  onUserUpdate={setUserData}
                  tierConfig={tierConfig}
                  theme={theme}
                  onThemeChange={setTheme}
                  perfMode={perfMode}
                  onPerfModeChange={handlePerfModeChange}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function TierBadge({ tier }: { tier: string }) {
  if (tier === 'og') {
    return <div className="text-[10px] font-bold badge-og" style={{ letterSpacing: '0.05em' }}>OG</div>
  }
  const colors: Record<string, string> = { premium: '#a855f7', pro: '#3b82f6', standard: '#666' }
  const labels: Record<string, string> = { premium: 'Premium', pro: 'Pro', standard: 'Standard' }
  return (
    <div className="text-[10px] font-medium" style={{ color: colors[tier] || '#666' }}>
      {labels[tier] || tier}
    </div>
  )
}
