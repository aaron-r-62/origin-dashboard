'use client'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Edit2, Clock, Copy, Check, Activity, AlertTriangle, Lock, CheckCircle } from 'lucide-react'
import type { User } from '@/lib/supabase'
import { canUpdate, createClient } from '@/lib/supabase'
import Toast from '@/components/ui/Toast'

interface Props {
  user: User
  onUserUpdate: (u: User) => void
  tierConfig: ReturnType<typeof import('@/lib/supabase').getTierConfig>
}

interface FieldState {
  visible: boolean
  editing: boolean
  value: string
  loading: boolean
}

interface AuthLog {
  id: string
  reason: string // Matches your 'reason' column
  created_at: string // Matches your 'created_at' column
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  success: {
    label: 'Successful login',
    color: '#22c55e',
    icon: <CheckCircle size={13} />,
  },
  hwid_mismatch: {
    label: 'HWID mismatch',
    color: '#f59e0b',
    icon: <AlertTriangle size={13} />,
  },
  wrong_password: {
    label: 'Wrong password',
    color: '#ef4444',
    icon: <Lock size={13} />,
  },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function HomeTab({ user, onUserUpdate, tierConfig }: Props) {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [fields, setFields] = useState<Record<string, FieldState>>({
    username: { visible: true, editing: false, value: user.username, loading: false },
    password: { visible: false, editing: false, value: '', loading: false },
    hwid: { visible: false, editing: false, value: user.hwid || '', loading: false },
    license_key: { visible: false, editing: false, value: user.license_key, loading: false },
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [authLogs, setAuthLogs] = useState<AuthLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') =>
    setToast({ msg, type })

  // Updated to match your screenshot: username (text) and reason (text)
  useEffect(() => {
    const supabase = createClient()
    setLogsLoading(true)
    
    supabase
      .from('auth_logs')
      .select('id, reason, created_at')
      .eq('username', user.username) 
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setAuthLogs(data || [])
        setLogsLoading(false)
      })
  }, [user.username])

  const toggleVisibility = (field: string) => {
    setFields(f => ({ ...f, [field]: { ...f[field], visible: !f[field].visible } }))
  }

  const startEdit = (field: string) => {
    const cooldownMap: Record<string, string | null> = {
      username: user.username_updated_at,
      password: user.password_updated_at,
      hwid: user.hwid_updated_at,
    }
    const { allowed, hoursLeft } = canUpdate(cooldownMap[field] ?? null)
    if (!allowed) {
      showToast(`You can update ${field} again in ${hoursLeft}h`, 'error')
      return
    }
    setFields(f => ({
      ...f,
      [field]: { ...f[field], editing: true, value: field === 'password' ? '' : (user[field as keyof User] as string) || '' },
    }))
  }

  const cancelEdit = (field: string) => {
    setFields(f => ({
      ...f,
      [field]: { ...f[field], editing: false, value: field === 'password' ? '' : (user[field as keyof User] as string) || '' },
    }))
  }

  const saveField = async (field: string) => {
    const val = fields[field].value.trim()
    if (!val) { showToast('Field cannot be empty', 'error'); return }

    setFields(f => ({ ...f, [field]: { ...f[field], loading: true } }))
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: val }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      onUserUpdate({ ...user, [field]: val, [`${field}_updated_at`]: new Date().toISOString() })
      setFields(f => ({ ...f, [field]: { ...f[field], editing: false, loading: false } }))
      showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`)
    } catch (e: any) {
      showToast(e.message || 'Update failed', 'error')
      setFields(f => ({ ...f, [field]: { ...f[field], loading: false } }))
    }
  }

  const copyField = async (field: string) => {
    const val = (user[field as keyof User] as string) || ''
    await navigator.clipboard.writeText(val)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
    showToast('Copied to clipboard')
  }

  const displayFields = [
    { key: 'username', label: 'Username', editable: true, copyable: true, updatedAt: user.username_updated_at },
    { key: 'password', label: 'Password', editable: true, copyable: false, updatedAt: user.password_updated_at },
    { key: 'hwid', label: 'Hardware ID', editable: true, copyable: true, updatedAt: user.hwid_updated_at },
    { key: 'license_key', label: 'License Key', editable: false, copyable: true, updatedAt: null },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">Account Details</h1>
        <p className="text-[13px] text-[#555] mt-1">Manage your credentials and preferences.</p>
      </div>

      {/* Tier banner */}
      <div
        className="rounded-xl p-4 flex items-center justify-between relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(10,10,10,0.9), ${tierConfig.glowColor.replace('0.15', '0.25')})`,
          border: `1px solid ${tierConfig.accentColor}22`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
            style={{ background: tierConfig.gradient }}
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[14px] font-medium">{user.username}</div>
            <div className="text-[12px]" style={{ color: tierConfig.accentColor }}>
              {tierConfig.label} Member
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-[#444]">Member since</div>
          <div className="text-[12px] text-[#666]">
            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
        {user.tier === 'og' && (
          <div className="absolute inset-0 badge-og-bg opacity-10 pointer-events-none rounded-xl" />
        )}
      </div>

      {/* Credential fields */}
      <div className="card space-y-5">
        <h2 className="text-[13px] font-medium text-[#555] uppercase tracking-widest">Credentials</h2>

        {displayFields.map(({ key, label, editable, copyable, updatedAt }) => {
          const field = fields[key]
          const isSecure = key !== 'username'
          const { allowed } = canUpdate(updatedAt)

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] text-[#444] font-medium uppercase tracking-widest">{label}</label>
                <div className="flex items-center gap-0.5">
                  {!allowed && editable && (
                    <span className="text-[10px] text-[#333] flex items-center gap-1 mr-1">
                      <Clock size={9} /> cooldown
                    </span>
                  )}
                  {copyable && !field.editing && (
                    <button onClick={() => copyField(key)} className="p-1.5 rounded text-[#444] hover:text-white transition-colors">
                      {copiedField === key ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  )}
                  {isSecure && (
                    <button onClick={() => toggleVisibility(key)} className="p-1.5 rounded text-[#444] hover:text-white transition-colors">
                      {field.visible ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  )}
                  {editable && !field.editing && (
                    <button onClick={() => startEdit(key)} className="p-1.5 rounded text-[#444] hover:text-white transition-colors">
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {field.editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type={key === 'password' ? 'password' : 'text'}
                    value={field.value}
                    onChange={e => setFields(f => ({ ...f, [key]: { ...f[key], value: e.target.value } }))}
                    className="input-field text-[13px]"
                    placeholder={`New ${label.toLowerCase()}...`}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && saveField(key)}
                  />
                  <button onClick={() => saveField(key)} disabled={field.loading} className="btn btn-primary text-[12px] py-2 px-3 flex-shrink-0">
                    {field.loading ? '...' : 'Save'}
                  </button>
                  <button onClick={() => cancelEdit(key)} className="btn btn-ghost text-[12px] py-2 px-3 flex-shrink-0">✕</button>
                </div>
              ) : (
                <div
                  className="code-block text-[12px] truncate select-none"
                  style={!field.visible && isSecure ? { filter: 'blur(6px)' } : {}}
                >
                  {field.visible
                    ? (key === 'password' ? '(hidden — use edit to change)' : (user[key as keyof User] as string) || '—')
                    : '•'.repeat(22)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Recent Activity — live from auth_logs */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={14} className="text-[#555]" />
          <h2 className="text-[13px] font-medium text-[#555] uppercase tracking-widest">Recent Activity</h2>
        </div>

        {logsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 rounded-lg bg-[#0d0d0d] animate-pulse" />
            ))}
          </div>
        ) : authLogs.length === 0 ? (
          <p className="text-[13px] text-[#444] py-2">No recent activity found.</p>
        ) : (
          <div className="space-y-2">
            {authLogs.map(log => {
              // We use log.reason because that's what your table column is called
              const cfg = ACTION_CONFIG[log.reason] || {
                label: log.reason,
                color: '#888',
                icon: <Activity size={13} />,
              }
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}18` }}
                >
                  <div className="flex items-center gap-2.5" style={{ color: cfg.color }}>
                    {cfg.icon}
                    <span className="text-[13px] text-white">{cfg.label}</span>
                  </div>
                  <span className="text-[11px] text-[#444]">{timeAgo(log.created_at)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
