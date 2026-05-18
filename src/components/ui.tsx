import type { ReactNode } from 'react'
import { InfoTooltip } from './InfoTooltip'

export function SectionHeader({ title, subtitle, tooltip, action }: { title: string; subtitle?: string; tooltip?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">{title}</h1>
          {tooltip ? <InfoTooltip text={tooltip} /> : null}
        </div>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5 lg:p-4 xl:p-5 ${className}`}>{children}</section>
}

export function Field({ label, tooltip, children }: { label: string; tooltip?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
        {label}
        {tooltip ? <InfoTooltip text={tooltip} /> : null}
      </span>
      {children}
    </label>
  )
}

export function TooltipLabel({ children, tooltip }: { children: ReactNode; tooltip: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <InfoTooltip text={tooltip} />
    </span>
  )
}

export const inputClass =
  'w-full min-h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:text-sm'

export const buttonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50'

export const secondaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50'

export const dangerButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50'
