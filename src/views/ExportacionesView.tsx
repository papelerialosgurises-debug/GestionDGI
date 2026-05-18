import { useState } from 'react'
import type { FormEvent } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { Field, Panel, SectionHeader, buttonClass, inputClass } from '../components/ui'
import { useAppStore } from '../store/useAppStore'
import { currentMonth, currentYear, monthNames } from '../utils/date'
import { exportarExcel } from '../utils/exportExcel'

export function ExportacionesView() {
  const { empresas, compras, ventas, config } = useAppStore()
  const [mode, setMode] = useState<'month' | 'months' | 'range'>('month')
  const [month, setMonth] = useState(currentMonth())
  const [toMonth, setToMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await exportarExcel(empresas, compras, ventas, config, mode === 'month' ? { month, year } : mode === 'months' ? { fromMonth: month, toMonth, year } : { from, to })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SectionHeader title="Exportaciones" subtitle="Genera archivos Excel con hojas separadas, estilos, totales y liquidacion estimada." tooltip="El Excel incluye compras, ventas, empresas, resumen mensual y liquidacion estimada." />
      <Panel className="max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Tipo de exportacion" tooltip="Elegir si queres exportar un mes, varios meses del mismo ano o un rango exacto de fechas."><select className={inputClass} value={mode} onChange={(e) => setMode(e.target.value as 'month' | 'months' | 'range')}><option value="month">Exportar un mes</option><option value="months">Exportar varios meses</option><option value="range">Exportar rango de fechas</option></select></Field>
          {mode === 'month' ? <div className="grid gap-3 md:grid-cols-2"><Field label="Mes" tooltip="Mes que se incluira en el Excel."><select className={inputClass} value={month} onChange={(e) => setMonth(Number(e.target.value))}>{monthNames.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}</select></Field><Field label="Ano" tooltip="Ano del mes a exportar."><input className={inputClass} type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} /></Field></div> : mode === 'months' ? <div className="grid gap-3 md:grid-cols-3"><Field label="Desde mes" tooltip="Primer mes que se incluira en el Excel."><select className={inputClass} value={month} onChange={(e) => setMonth(Number(e.target.value))}>{monthNames.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}</select></Field><Field label="Hasta mes" tooltip="Ultimo mes que se incluira en el Excel."><select className={inputClass} value={toMonth} onChange={(e) => setToMonth(Number(e.target.value))}>{monthNames.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}</select></Field><Field label="Ano" tooltip="Ano de los meses a exportar."><input className={inputClass} type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} /></Field></div> : <div className="grid gap-3 md:grid-cols-2"><Field label="Desde" tooltip="Fecha inicial del rango que se incluira en el Excel."><input className={inputClass} type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field><Field label="Hasta" tooltip="Fecha final del rango que se incluira en el Excel."><input className={inputClass} type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field></div>}
          <button className={buttonClass} type="submit" disabled={busy}><FileSpreadsheet size={16} />{busy ? 'Exportando...' : 'Exportar Excel'}</button>
        </form>
      </Panel>
    </>
  )
}
