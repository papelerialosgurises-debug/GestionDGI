type Props = {
  text: string
}

export function InfoTooltip({ text }: Props) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300/45 bg-white/25 text-[10px] font-semibold text-slate-500/45 opacity-45 transition hover:border-slate-400/70 hover:bg-white/45 hover:text-slate-600/80 hover:opacity-75 focus:border-slate-400/70 focus:bg-white focus:text-slate-600 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-200"
        aria-label="Informacion"
      >
        i
      </button>
      <span className="pointer-events-none absolute left-1/2 top-8 z-30 w-64 max-w-[80vw] -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs font-normal leading-5 text-slate-600 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100">
        {text}
      </span>
    </span>
  )
}
