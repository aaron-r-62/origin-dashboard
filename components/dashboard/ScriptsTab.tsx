'use client'
import { useState } from 'react'
import { Copy, Check, ExternalLink, Terminal, BookOpen, Clock, Monitor, Apple, XCircle, CheckCircle } from 'lucide-react'
import type { User } from '@/lib/supabase'
import Toast from '@/components/ui/Toast'

const LOADSTRING = `loadstring(game:HttpGet('https://getorigin.cc/load'))()`

const CHANGELOGS = [
  {
    version: 'v2.4.1',
    date: '2026-04-20',
    notes: ['Fixed HWID detection on Windows 11 24H2', 'Improved injection speed by 40%', 'Added auto-update support'],
  },
  {
    version: 'v2.4.0',
    date: '2026-04-10',
    notes: ['New executor compatibility list', 'Discord webhook integration', 'Premium nebula UI theme'],
  },
  {
    version: 'v2.3.5',
    date: '2026-03-28',
    notes: ['Stability fixes for Roblox update', 'OG shimmer badge redesign'],
  },
]

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
  { n: '01', label: 'Prepare your executor', desc: 'Make sure you\'re using a solid executor. We recommend one with high UNC/sUNC support for the best experience.' },
  { n: '02', label: 'Open Roblox', desc: 'Launch the game you want to play.' },
  { n: '03', label: 'Copy the script', desc: 'Grab the loadstring from the top of the page.' },
  { n: '04', label: 'Attach and Run', desc: 'Inject your executor into the game, then hit the Execute button.' },
  { n: '05', label: 'Sign in', desc: 'Use the account details you created in the #register channel.' },
  { n: '06', label: "You're all set", desc: 'The script should be active. Enjoy.' },
]

interface Props {
  user: User
  tierConfig: any
}

export default function ScriptsTab({ user, tierConfig }: Props) {
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [expandedLog, setExpandedLog] = useState<number | null>(0)

  const isPremiumOrAbove = user.tier === 'premium' || user.tier === 'og'

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

      {/* ── Main Loader ── */}
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
          <a
            href="https://docs.getorigin.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost text-[12px] py-2 gap-1.5"
          >
            <BookOpen size={12} /> Documentation <ExternalLink size={10} className="opacity-50" />
          </a>
          <a
            href="https://discord.gg/GnJSjfkYec"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost text-[12px] py-2 gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.019.01.036.025.047a19.904 19.904 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Support
          </a>
        </div>
      </div>

      {/* ── Supported Executors (Premium/OG only) ── */}
      {isPremiumOrAbove ? (
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
                <div
                  key={name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px]"
                  style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}
                >
                  <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                  {name}
                </div>
              ))}
              {EXECUTORS.windows.unsupported.map(name => (
                <div
                  key={name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] opacity-60"
                  style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}
                >
                  <XCircle size={12} className="text-red-500 flex-shrink-0" />
                  <span className="line-through text-[#666]">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* macOS */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Apple size={12} className="text-[#555]" />
              <span className="text-[12px] font-medium text-[#777] uppercase tracking-wider">macOS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXECUTORS.macos.supported.map(name => (
                <div
                  key={name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px]"
                  style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}
                >
                  <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                  {name}
                </div>
              ))}
              {EXECUTORS.macos.unsupported.map(name => (
                <div
                  key={name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] opacity-60"
                  style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}
                >
                  <XCircle size={12} className="text-red-500 flex-shrink-0" />
                  <span className="line-through text-[#666]">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Locked state for non-premium */
        <div
          className="card flex items-center gap-4 opacity-60"
          style={{ border: '1px solid #1a1a1a' }}
        >
          <div className="w-9 h-9 rounded-lg bg-[#111] flex items-center justify-center flex-shrink-0">
            <Monitor size={16} className="text-[#444]" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-medium">Supported Executors</div>
            <div className="text-[12px] text-[#555]">Available to Premium and OG members only.</div>
          </div>
          <span className="text-[11px] text-[#555] px-2 py-1 rounded border border-[#1a1a1a]">🔒 Premium</span>
        </div>
      )}

      {/* ── Changelog ── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={14} className="text-[#555]" />
          <h2 className="text-[13px] font-medium text-[#555] uppercase tracking-widest">Change Logs</h2>
        </div>
        <div className="space-y-2">
          {CHANGELOGS.map((log, i) => (
            <div key={log.version} className="border border-[#111] rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedLog(expandedLog === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.015] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-mono font-medium" style={{ color: tierConfig.accentColor }}>
                    {log.version}
                  </span>
                  <span className="text-[11px] text-[#444]">{log.date}</span>
                  {i === 0 && (
                    <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">
                      Latest
                    </span>
                  )}
                </div>
                <span className="text-[#444] text-[11px]">{expandedLog === i ? '▲' : '▼'}</span>
              </button>
              {expandedLog === i && (
                <div className="px-4 pb-3 pt-2 space-y-1.5 border-t border-[#0d0d0d]">
                  {log.notes.map(note => (
                    <div key={note} className="flex items-start gap-2">
                      <span className="text-green-500 text-[12px] mt-px">+</span>
                      <span className="text-[12px] text-[#777]">{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Start Guide ── */}
      <div className="card">
        <h2 className="text-[13px] font-medium text-[#555] uppercase tracking-widest mb-5">Quick Start Guide</h2>
        <div className="space-y-4">
          {QUICK_START.map(item => (
            <div key={item.n} className="flex gap-4">
              <div
                className="text-[11px] font-mono w-6 flex-shrink-0 mt-0.5 font-medium"
                style={{ color: tierConfig.accentColor }}
              >
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
