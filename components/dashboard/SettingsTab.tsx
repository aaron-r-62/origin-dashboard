'use client'
import { useState } from 'react'
import { Webhook, Zap, Trash2, Bell, Moon, Shield, Check, LogOut } from 'lucide-react'
import type { User } from '@/lib/supabase'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Toast from '@/components/ui/Toast'

interface Props {
  user: User
  onUserUpdate: (u: User) => void
  tierConfig: any
  // Theme & perf mode are owned by DashboardClient so changes actually take effect
  theme: 'obsidian' | 'midnight'
  onThemeChange: (t: 'obsidian' | 'midnight') => void
  perfMode: boolean
  onPerfModeChange: (v: boolean) => void
}

export default function SettingsTab({ user, onUserUpdate, tierConfig, theme, onThemeChange, perfMode, onPerfModeChange }: Props) {
  const [webhook, setWebhook] = useState(user.webhook_url || '')
  const [webhookSaved, setWebhookSaved] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') =>
    setToast({ msg, type })

  const saveWebhook = async () => {
    if (webhook && !webhook.startsWith('https://discord.com/api/webhooks/')) {
      showToast('Enter a valid Discord webhook URL', 'error')
      return
    }
    setWebhookLoading(true)
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: 'webhook_url', value: webhook }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUserUpdate({ ...user, webhook_url: webhook })
      setWebhookSaved(true)
      setTimeout(() => setWebhookSaved(false), 2500)
      showToast('Webhook saved')
    } catch (e: any) {
      showToast(e.message || 'Failed to save webhook', 'error')
    } finally {
      setWebhookLoading(false)
    }
  }

  const testWebhook = async () => {
    if (!webhook) { showToast('Enter a webhook URL first', 'error'); return }
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '🚀 Origin Test Notification',
            description: 'Your webhook is configured correctly!',
            color: 0xa855f7,
            footer: { text: 'Origin Dashboard' },
            timestamp: new Date().toISOString(),
          }],
        }),
      })
      showToast('Test notification sent!')
    } catch {
      showToast('Webhook test failed. Check the URL.', 'error')
    }
  }

  const togglePerfMode = async () => {
    const next = !perfMode
    onPerfModeChange(next) // updates DashboardClient → applies class to <html>
    await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field: 'performance_mode', value: next }),
    })
    onUserUpdate({ ...user, performance_mode: next })
    showToast(next ? 'Performance mode on — animations disabled' : 'Performance mode off', 'info')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== user.username) {
      showToast('Username does not match', 'error')
      return
    }
    try {
      const res = await fetch('/api/user/delete', { method: 'POST' })
      if (!res.ok) throw new Error('Delete failed')
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (e: any) {
      showToast(e.message || 'Failed to delete account', 'error')
    }
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ background: value ? tierConfig.accentColor : '#1a1a1a' }}
    >
      <div
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200"
        style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
        <p className="text-[13px] text-[#555] mt-1">Preferences and account management.</p>
      </div>

      {/* Discord Webhook */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Webhook size={14} style={{ color: tierConfig.accentColor }} />
          <h2 className="text-[14px] font-semibold">Discord Webhooks</h2>
        </div>
        <p className="text-[12px] text-[#555] mb-4">Receive execution logs directly in your Discord server.</p>

        <div className="space-y-3">
          <input
            type="url"
            value={webhook}
            onChange={e => setWebhook(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="input-field text-[13px]"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={saveWebhook}
              disabled={webhookLoading}
              className="btn btn-primary text-[12px] py-2 px-4"
            >
              {webhookSaved ? <><Check size={13} /> Saved</> : webhookLoading ? 'Saving...' : 'Save Webhook'}
            </button>
            <button onClick={testWebhook} className="btn btn-ghost text-[12px] py-2 px-4">
              Test
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[#050505] border border-[#0d0d0d]">
          <p className="text-[11px] text-[#333] mb-1.5 uppercase tracking-wider font-medium">What gets logged</p>
          {['Script execution events', 'Login activity', 'HWID changes', 'Account modifications'].map(item => (
            <div key={item} className="flex items-center gap-2 text-[12px] text-[#555] py-0.5">
              <span className="text-green-600">•</span> {item}
            </div>
          ))}
        </div>
      </div>

      {/* UI Preferences */}
      <div className="card space-y-0">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-[#555]" />
          <h2 className="text-[14px] font-semibold">UI Preferences</h2>
        </div>

        {/* Performance Mode */}
        <div className="flex items-center justify-between py-3 border-b border-[#0d0d0d]">
          <div>
            <div className="text-[13px] font-medium">Performance Mode</div>
            <div className="text-[12px] text-[#555]">Disable animations and blur for lower-end hardware.</div>
          </div>
          <Toggle value={perfMode} onChange={togglePerfMode} />
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between py-3 border-b border-[#0d0d0d]">
          <div>
            <div className="text-[13px] font-medium flex items-center gap-1.5">
              <Bell size={12} className="text-[#555]" /> Script Notifications
            </div>
            <div className="text-[12px] text-[#555]">Show in-dashboard alerts on script execution.</div>
          </div>
          <Toggle value={notifications} onChange={() => setNotifications(v => !v)} />
        </div>

        {/* Theme Selector */}
        <div className="py-3">
          <div className="text-[13px] font-medium flex items-center gap-1.5 mb-3">
            <Moon size={12} className="text-[#555]" /> Dashboard Theme
          </div>
          <div className="flex gap-2">
            {([
              { id: 'obsidian', label: 'Obsidian', swatch: '#000000' },
              { id: 'midnight', label: 'Midnight', swatch: '#05050f' },
            ] as const).map(t => (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)} // directly updates DashboardClient state
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] transition-all"
                style={{
                  background: t.swatch,
                  borderColor: theme === t.id ? tierConfig.accentColor : '#1a1a1a',
                  color: theme === t.id ? '#fff' : '#555',
                }}
              >
                <div className="w-3 h-3 rounded-sm border border-[#2a2a2a]" style={{ background: t.swatch }} />
                {t.label}
                {theme === t.id && <Check size={11} style={{ color: tierConfig.accentColor }} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} className="text-[#555]" />
          <h2 className="text-[14px] font-semibold">Security</h2>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-[#0d0d0d]">
          <div>
            <div className="text-[13px] font-medium">Two-Factor Authentication</div>
            <div className="text-[12px] text-[#555]">Extra layer of security via Discord OAuth.</div>
          </div>
          <div className="text-[11px] text-green-500 flex items-center gap-1">
            <Check size={11} /> Active
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-[13px] font-medium">Discord ID</div>
            <div className="text-[12px] text-[#555] font-mono">{user.discord_id}</div>
          </div>
          <div className="text-[11px] text-[#444]">Linked</div>
        </div>
      </div>

      {/* Account Management */}
      <div className="card space-y-2">
        <h2 className="text-[13px] font-medium text-[#555] uppercase tracking-widest mb-3">Account Management</h2>

        <button
          onClick={handleLogout}
          className="btn btn-ghost w-full text-[13px] py-2.5 justify-start gap-2"
        >
          <LogOut size={14} /> Sign out
        </button>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="btn btn-danger w-full text-[13px] py-2.5 justify-start gap-2"
          >
            <Trash2 size={14} /> Delete account data
          </button>
        ) : (
          <div className="p-4 rounded-lg border border-red-900/40 bg-red-950/10 space-y-3">
            <p className="text-[12px] text-red-400">
              This is <strong>irreversible</strong>. Type your username <strong>{user.username}</strong> to confirm.
            </p>
            <input
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder={user.username}
              className="input-field text-[13px]"
              style={{ borderColor: 'rgba(239,68,68,0.3)' }}
            />
            <div className="flex gap-2">
              <button onClick={handleDeleteAccount} className="btn btn-danger text-[12px] py-2 px-4">
                Confirm Delete
              </button>
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteInput('') }}
                className="btn btn-ghost text-[12px] py-2 px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
