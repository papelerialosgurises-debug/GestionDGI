import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './toastContext'
import type { ToastContextValue, ToastType } from './toastContext'

type Toast = {
  id: string
  type: ToastType
  message: string
}

const styles: Record<ToastType, { icon: ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle2 size={20} />,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  error: {
    icon: <XCircle size={20} />,
    className: 'border-red-200 bg-red-50 text-red-800',
  },
  warning: {
    icon: <TriangleAlert size={20} />,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  info: {
    icon: <Info size={20} />,
    className: 'border-sky-200 bg-sky-50 text-sky-800',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, type, message }].slice(-4))
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (message) => toast('success', message),
      error: (message) => toast('error', message),
      warning: (message) => toast('warning', message),
      info: (message) => toast('info', message),
    }),
    [toast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-5 sm:top-5">
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(toast.id), 3800)
    return () => window.clearTimeout(timeout)
  }, [onDismiss, toast.id])

  const style = styles[toast.type]

  return (
    <div className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg shadow-slate-900/10 ${style.className}`}>
      <span className="mt-0.5 shrink-0">{style.icon}</span>
      <p className="min-w-0 flex-1 text-sm font-medium leading-5">{toast.message}</p>
      <button
        type="button"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-70 transition hover:bg-white/60 hover:opacity-100"
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar notificacion"
      >
        <X size={16} />
      </button>
    </div>
  )
}
