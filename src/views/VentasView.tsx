import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ExportButton } from '../components/ExportButton'
import { Field, Panel, SectionHeader, TooltipLabel, buttonClass, dangerButtonClass, inputClass, secondaryButtonClass } from '../components/ui'
import { InfoTooltip } from '../components/InfoTooltip'
import { useAppStore } from '../store/useAppStore'
import type { Venta } from '../types'
import { currentMonth, currentYear, formatDate, getMonth, getYear, monthNames } from '../utils/date'
import { formatearMoneda } from '../utils/format'
import { calcularVentaConIVAIncluido } from '../utils/tax'

const emptyVenta = (): Venta => ({ id: crypto.randomUUID(), fecha: new Date().toISOString().slice(0, 10), montoTotal: 0, descripcion: '', ventaSinIVA: 0, iva: 0 })

export function VentasView() {
  const { ventas, addVenta, updateVenta, deleteVenta, config } = useAppStore()
  const [form, setForm] = useState<Venta>(emptyVenta())
  const [month, setMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())
  const editing = ventas.some((item) => item.id === form.id)
  const calculo = calcularVentaConIVAIncluido(Number(form.montoTotal), config.tasaIVA, config.decimales)
  const filtered = useMemo(() => ventas.filter((item) => getMonth(item.fecha) === month && getYear(item.fecha) === year), [ventas, month, year])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!form.fecha || Number(form.montoTotal) <= 0) return
    const payload = { ...form, montoTotal: Number(form.montoTotal), ...calculo }
    if (editing) {
      updateVenta(payload)
    } else {
      addVenta(payload)
    }
    setForm(emptyVenta())
  }

  return (
    <>
      <SectionHeader title="Ventas" subtitle="Todas las ventas se ingresan con IVA incluido." tooltip="El monto total vendido ya contiene el 22% de IVA, o la tasa configurada." action={<ExportButton month={month} year={year} />} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Panel>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Fecha" tooltip="Fecha en la que se realizo la venta o corresponde registrarla."><input className={inputClass} type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
            <Field label="Monto total vendido" tooltip="Todas las ventas se ingresan con IVA incluido."><input className={inputClass} type="number" min="0" step="0.01" value={form.montoTotal || ''} onChange={(e) => setForm({ ...form, montoTotal: Number(e.target.value) })} /></Field>
            <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm md:grid-cols-2"><div><p className="text-slate-500"><TooltipLabel tooltip="Parte de la venta que corresponde al monto neto sin IVA.">Venta sin IVA</TooltipLabel></p><strong>{formatearMoneda(calculo.ventaSinIVA, config)}</strong></div><div><p className="text-slate-500"><TooltipLabel tooltip="IVA generado por la venta. Se suma al IVA ventas del mes.">IVA venta</TooltipLabel></p><strong>{formatearMoneda(calculo.iva, config)}</strong></div></div>
            <Field label="Descripcion/notas" tooltip="Detalle interno de la venta o comentario para identificarla luego."><textarea className={inputClass} rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Field>
            <span className="inline-flex items-center gap-2"><button className={buttonClass} type="submit"><Plus size={16} />{editing ? 'Guardar' : 'Registrar'}</button><InfoTooltip text="Guarda la venta y calcula automaticamente venta sin IVA e IVA venta." /></span>
          </form>
        </Panel>
        <Panel>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <Field label="Filtro mes" tooltip="Muestra solo ventas del mes seleccionado."><select className={inputClass} value={month} onChange={(e) => setMonth(Number(e.target.value))}>{monthNames.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}</select></Field>
            <Field label="Filtro ano" tooltip="Muestra solo ventas del ano seleccionado."><input className={inputClass} type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} /></Field>
          </div>
          <div className="overflow-visible md:overflow-x-auto xl:overflow-visible"><table className="tablet-card-table tablet-table w-full min-w-[720px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="py-2"><TooltipLabel tooltip="Fecha registrada para la venta.">Fecha</TooltipLabel></th><th><TooltipLabel tooltip="Total vendido con IVA incluido.">Total con IVA</TooltipLabel></th><th><TooltipLabel tooltip="Monto vendido sin IVA.">Venta sin IVA</TooltipLabel></th><th><TooltipLabel tooltip="IVA generado por esta venta.">IVA venta</TooltipLabel></th><th className="tablet-actions text-right"><TooltipLabel tooltip="Editar o eliminar la venta.">Acciones</TooltipLabel></th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.id}><td className="py-3" data-label="Fecha">{formatDate(item.fecha)}</td><td className="tablet-card-primary font-medium text-slate-950" data-label="Total con IVA">{formatearMoneda(item.montoTotal, config)}</td><td data-label="Venta sin IVA">{formatearMoneda(item.ventaSinIVA, config)}</td><td data-label="IVA venta">{formatearMoneda(item.iva, config)}</td><td className="tablet-card-actions text-right" data-label="Acciones"><span className="inline-flex items-center gap-2"><button className={secondaryButtonClass} onClick={() => setForm(item)}><Edit2 size={15} /></button><InfoTooltip text="Carga esta venta en el formulario para modificarla." /></span><span className="ml-2 inline-flex items-center gap-2"><button className={dangerButtonClass} onClick={() => confirm('Eliminar venta?') && deleteVenta(item.id)}><Trash2 size={15} /></button><InfoTooltip text="Elimina definitivamente esta venta del control local." /></span></td></tr>)}</tbody></table></div>
        </Panel>
      </div>
    </>
  )
}
