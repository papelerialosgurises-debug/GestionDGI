import { Building2, Calculator, FileDown, Home, LogOut, Menu, ReceiptText, Settings, ShoppingCart, X } from 'lucide-react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { ViewKey } from '../types'
import { useAppStore } from '../store/useAppStore'

const nav: { key: ViewKey; label: string; icon: ReactNode }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
  { key: 'empresas', label: 'Empresas', icon: <Building2 size={18} /> },
  { key: 'compras', label: 'Compras', icon: <ShoppingCart size={18} /> },
  { key: 'ventas', label: 'Ventas', icon: <ReceiptText size={18} /> },
  { key: 'liquidacion', label: 'Liquidacion mensual', icon: <Calculator size={18} /> },
  { key: 'exportaciones', label: 'Exportaciones', icon: <FileDown size={18} /> },
  { key: 'configuracion', label: 'Configuracion', icon: <Settings size={18} /> },
]

export function Layout({
  activeView,
  setActiveView,
  children,
}: {
  activeView: ViewKey
  setActiveView: (view: ViewKey) => void
  children: ReactNode
}) {
  const { logout, config, loading, error, clearError } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 lg:flex">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Control IVA</p>
          <h2 className="truncate text-base font-semibold text-slate-950">{config.nombreNegocio}</h2>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu size={21} />
        </button>
      </header>

      {sidebarOpen ? <button type="button" className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[1px] lg:hidden" aria-label="Cerrar menu" onClick={() => setSidebarOpen(false)} /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[min(82vw,20rem)] border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:fixed lg:inset-y-0 lg:w-60 lg:translate-x-0 lg:shadow-none xl:w-64 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 lg:min-h-0 lg:flex-col lg:items-start lg:gap-7 lg:border-b-0 lg:p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Control IVA</p>
            <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-950">{config.nombreNegocio}</h2>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menu"
          >
            <X size={19} />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-3">
          {nav.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveView(item.key)
                setSidebarOpen(false)
              }}
              className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition ${
                activeView === item.key ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false)
              logout()
            }}
            className="mt-6 flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <LogOut size={18} />
            Cerrar sesion
          </button>
        </nav>
        <div className="px-5 pb-5 pt-4 text-xs leading-5 text-slate-500">
          Herramienta interna de control y estimacion. No integra DGI ni genera declaraciones oficiales.
        </div>
      </aside>
      <main className="min-w-0 flex-1 lg:pl-60 xl:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-5 md:px-6 lg:px-6 lg:py-6 xl:px-8">
          {error ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
              <button type="button" className="font-semibold" onClick={clearError}>
                Cerrar
              </button>
            </div>
          ) : null}
          {loading ? <p className="mb-4 text-sm text-slate-500">Cargando datos del servidor...</p> : null}
          {children}
        </div>
      </main>
    </div>
  )
}
