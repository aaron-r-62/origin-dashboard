'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Terminal, BookOpen, Clock, Monitor, XCircle, CheckCircle } from 'lucide-react'
import type { User } from '@/lib/supabase'
import { createClient } from '@/lib/supabase'
import Toast from '@/components/ui/Toast'

const LOADSTRING = `loadstring(game:HttpGet('https://getorigin.cc/load'))()`

const EXECUTORS = {
  windows: {
    supported: ['Potassium', 'Volt', 'Wave', 'Synapse Z', 'Seliware', 'Cosmic', 'Isaeva', 'Volcano', 'Bunni', 'SirHurt', 'YuB-X', 'Madium'],
    unsupported: ['Solara', 'Xeno', 'Velocity'],
  },
  macos: {
    supported: ['MacSploit', 'Opiumware'],
    unsupported: ['Hydrogen'],
  },
}

const QUICK_START = [
  { n: '01', label: 'Prepare your executor', desc: "Make sure you're using a solid executor. We recommend one with high UNC/sUNC support for the best experience." },
  { n: '02', label: 'Open Roblox', desc: 'Launch the game you want to play.' },
  { n: '03', label: 'Copy the script', desc: 'Grab the loadstring from the top of the page.' },
  { n: '04', label: 'Attach and Run', desc: 'Inject your executor into the game, then hit the Execute button.' },
  { n: '05', label: 'Sign in', desc: 'Use the account details you created in the #register channel.' },
  { n: '06', label: "You're all set", desc: 'The script should be active. Enjoy.' },
]

interface Changelog {
  id: string
  version: string
  notes: string[]
  created_at: string
}

interface Props {
  user: User
  tierConfig: any
}

export default function ScriptsTab({ user, tierConfig }: Props) {
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [changelogs, setChangelogs] = useState<Changelog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  const isPremiumOnly = user.tier === 'premium'

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('changelogs')
      .select('id, version, notes, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const logs = data || []
        setChangelogs(logs)
        if (logs.length > 0) setExpandedLog(logs[0].id) // auto-expand latest
        setLogsLoading(false)
      })
  }, [])

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setToast({ msg: 'Copied to clipboard', type: 'success' })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Scripts</h1>
        <p className="text-[13px] text-[#555] mt-1">Loader, executors, and quick start guide.</p>
      </div>

      {/* Main Loader */}
      <div
        className="rounded-xl p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #0a0a0a, ${tierConfig.glowColor.replace('0.15', '0.08')})`,
          border: `1px solid ${tierConfig.accentColor}22`,
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={14} style={{ color: tierConfig.accentColor }} />
          <h2 className="text-[14px] font-semibold">Main Loader</h2>
          <span className="ml-auto text-[11px] text-[#555] flex items-center gap-1.5">
            <div className="status-dot" /> Active
          </span>
        </div>

        <div className="code-block mb-4 flex items-center justify-between gap-3">
          <span className="text-[12px] text-green-400 flex-1 font-mono truncate">{LOADSTRING}</span>
          <button
            onClick={() => copy(LOADSTRING)}
            className="flex-shrink-0 p-1.5 rounded hover:bg-white/5 transition-colors text-[#555] hover:text-white"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <a href="https://docs.getorigin.cc" target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-[12px] py-2 gap-1.5">
            <BookOpen size={12} /> Documentation <ExternalLink size={10} className="opacity-50" />
          </a>
          <a href="https://discord.gg/GnJSjfkYec" target="_blank" rel="noopener noreferrer" className="btn btn-ghost text-[12px] py-2 gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.019.01.036.025.047a19.904 19.904 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Support
          </a>
        </div>
      </div>

      {/* Supported Executors — Premium only */}
      {isPremiumOnly && (
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Monitor size={14} style={{ color: tierConfig.accentColor }} />
            <h2 className="text-[14px] font-semibold">Supported Executors</h2>
            <span
              className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: `${tierConfig.accentColor}18`, color: tierConfig.accentColor }}
            >
              Premium
            </span>
          </div>
          <p className="text-[12px] text-[#555] mb-5">Check here to see if your executor is compatible with Origin Premium.</p>

          {/* Windows */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Monitor size={12} className="text-[#555]" />
              <span className="text-[12px] font-medium text-[#777] uppercase tracking-wider">Windows</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXECUTORS.windows.supported.map(name => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px]"
                  style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                  {name}
                </div>
              ))}
              {EXECUTORS.windows.unsupported.map(name => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] opacity-60"
                  style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                  <XCircle size={12} className="text-red-500 flex-shrink-0" />
                  <span className="line-through text-[#666]">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* macOS */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#555]">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-[12px] font-medium text-[#777] uppercase tracking-wider">macOS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXECUTORS.macos.supported.map(name => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px]"
                  style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                  {name}
                </div>
              ))}
              {EXECUTORS.macos.unsupported.map(name => (
                <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] opacity-60"
                  style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                  <XCircle size={12} className="text-red-500 flex-shrink-0" />
                  <span className="line-through text-[#666]">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Changelog — dynamic from Supabase */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={14} className="text-[#555]" />
          <h2 className="text-[13px] font-medium text-[#555] uppercase tracking-widest">Change Logs</h2>
        </div>

        {logsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-11 rounded-lg bg-[#0d0d0d] animate-pulse" />
            ))}
          </div>
        ) : changelogs.length === 0 ? (
          <p className="text-[13px] text-[#444]">No changelog entries yet.</p>
        ) : (
          <div className="space-y-2">
            {changelogs.map((log, i) => (
              <div key={log.id} className="border border-[#111] rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.015] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-mono font-medium" style={{ color: tierConfig.accentColor }}>
                      {log.version}
                    </span>
                    <span className="text-[11px] text-[#444]">
                      {new Date(log.created_at).toISOString().split('T')[0]}
                    </span>
                    {i === 0 && (
                      <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="text-[#444] text-[11px]">{expandedLog === log.id ? '▲' : '▼'}</span>
                </button>
                {expandedLog === log.id && (
                  <div className="px-4 pb-3 pt-2 space-y-1.5 border-t border-[#0d0d0d]">
                    {log.notes.map((note, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <span className="text-green-500 text-[12px] mt-px">+</span>
                        <span className="text-[12px] text-[#777]">{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Start Guide */}
      <div className="card">
        <h2 className="text-[13px] font-medium text-[#555] uppercase tracking-widest mb-5">Quick Start Guide</h2>
        <div className="space-y-4">
          {QUICK_START.map(item => (
            <div key={item.n} className="flex gap-4">
              <div className="text-[11px] font-mono w-6 flex-shrink-0 mt-0.5 font-medium" style={{ color: tierConfig.accentColor }}>
                {item.n}
              </div>
              <div>
                <div className="text-[13px] font-medium mb-0.5">{item.label}</div>
                <div className="text-[12px] text-[#555] leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
