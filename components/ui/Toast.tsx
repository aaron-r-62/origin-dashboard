'use client'
import { useEffect } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  const icons = {
    success: <CheckCircle size={15} className="text-green-400 flex-shrink-0" />,
    error: <AlertCircle size={15} className="text-red-400 flex-shrink-0" />,
    info: <CheckCircle size={15} className="text-blue-400 flex-shrink-0" />,
  }

  return (
    <div className="toast">
      {icons[type]}
      <span className="text-[13px] text-white flex-1">{message}</span>
      <button onClick={onClose} className="text-[#444] hover:text-white transition-colors ml-1">
        <X size={13} />
      </button>
    </div>
  )
}
