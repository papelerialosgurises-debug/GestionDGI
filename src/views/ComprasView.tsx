import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ExportButton } from '../components/ExportButton'
import { Field, Panel, SectionHeader, TooltipLabel, buttonClass, dangerButtonClass, inputClass, secondaryButtonClass } from '../components/ui'
import { InfoTooltip } from '../components/InfoTooltip'
import { useToast } from '../components/toastContext'
import { useAppStore } from '../store/useAppStore'
import type { Compra } from '../types'
import { currentMonth, currentYear, formatDate, isInMonth, monthNames } from '../utils/date'
import { formatearMoneda } from '../utils/format'
import { calcularCompraConIVAIncluido, calcularCompraSinIVAIncluido } from '../utils/tax'

const emptyCompra = (): Compra => ({ id: crypto.randomUUID(), fecha: new Date().toISOString().slice(0, 10), empresaId: '', montoIngresado: 0, tipo: 'iva_incluido', numero: '', descripcion: '', montoSinIVA: 0, iva: 0, montoTotal: 0 })

export function ComprasView() {
  const { compras, empresas, addCompra, updateCompra, deleteCompra, config } = useAppStore()
  const toast = useToast()
  const [form, setForm] = useState<Compra>(emptyCompra())
  const [month, setMonth] = useState(currentMonth())
  const [empresaId, setEmpresaId] = useState('all')
  const [tipo, setTipo] = useState('all')
  const editing = compras.some((item) => item.id === form.id)
  const calculo = form.tipo === 'iva_incluido' ? calcularCompraConIVAIncluido(Number(form.montoIngresado), config.tasaIVA, config.decimales) : calcularCompraSinIVAIncluido(Number(form.montoIngresado), config.tasaIVA, config.decimales)
  const filtered = useMemo(() => compras.filter((item) => isInMonth(item.fecha, month, currentYear()) && (empresaId === 'all' || item.empresaId === empresaId) && (tipo === 'all' || item.tipo === tipo)), [compras, month, empresaId, tipo])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.fecha || !form.empresaId || Number(form.montoIngresado) <= 0) return
    const payload = { ...form, montoIngresado: Number(form.montoIngresado), ...calculo }
    try {
      if (editing) {
        await updateCompra(payload)
        toast.success('Compra actualizada correctamente.')
      } else {
        await addCompra(payload)
        toast.success('Compra registrada correctamente.')
      }
      setForm(emptyCompra())
    } catch {
      toast.error('Ocurrio un error al guardar. Intenta nuevamente.')
    }
  }

  const removeCompra = async (id: string) => {
    if (!confirm('Eliminar compra?')) return
    try {
      await deleteCompra(id)
      toast.success('Compra eliminada correctamente.')
    } catch {
      toast.error('Ocurrio un error al eliminar. Intenta nuevamente.')
    }
  }

  return (
    <>
      <SectionHeader title="Compras" subtitle="Registro de compras con calculo automatico de IVA credito estimado." tooltip="IVA generado por la compra. Se usa como credito fiscal estimado." action={<ExportButton month={month} year={currentYear()} />} />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Panel>
          <form onSubmit={submit} className="space-y-3">
            <Field label="Fecha compra" tooltip="Fecha en la que se realizo la compra o figura en la boleta."><input className={inputClass} type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
            <Field label="Empresa/proveedor" tooltip="Proveedor al que corresponde la compra. Debe estar creado en Empresas."><select className={inputClass} value={form.empresaId} onChange={(e) => setForm({ ...form, empresaId: e.target.value })}><option value="">Seleccionar</option>{empresas.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></Field>
            <Field label="Monto ingresado" tooltip="Importe que figura en el comprobante o el monto neto, segun el tipo elegido."><input className={inputClass} type="number" min="0" step="0.01" value={form.montoIngresado || ''} onChange={(e) => setForm({ ...form, montoIngresado: Number(e.target.value) })} /></Field>
            <Field label="Tipo de monto" tooltip="Indica si el monto ingresado ya contiene IVA o si es neto y debe sumarse el IVA."><select className={inputClass} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Compra['tipo'] })}><option value="iva_incluido">Con IVA incluido</option><option value="sin_iva">Sin IVA incluido</option></select></Field>
            <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm md:grid-cols-3"><div><p className="text-slate-500"><TooltipLabel tooltip="Monto de la compra sin incluir IVA.">Monto sin IVA</TooltipLabel></p><strong>{formatearMoneda(calculo.montoSinIVA, config)}</strong></div><div><p className="text-slate-500"><TooltipLabel tooltip="IVA generado por la compra. Se usa como credito fiscal estimado.">IVA compra</TooltipLabel></p><strong>{formatearMoneda(calculo.iva, config)}</strong></div><div><p className="text-slate-500"><TooltipLabel tooltip="Total de la compra con IVA incluido.">Total con IVA</TooltipLabel></p><strong>{formatearMoneda(calculo.montoTotal, config)}</strong></div></div>
            <Field label="Numero factura/boleta" tooltip="Numero del comprobante para poder ubicarlo despues."><input className={inputClass} value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></Field>
            <Field label="Descripcion/notas" tooltip="Detalle interno de la compra, producto, servicio o comentario."><textarea className={inputClass} rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Field>
            <span className="inline-flex items-center gap-2"><button className={buttonClass} type="submit"><Plus size={16} />{editing ? 'Guardar' : 'Registrar'}</button><InfoTooltip text="Guarda la compra y recalcula automaticamente monto sin IVA, IVA y total." /></span>
          </form>
        </Panel>
        <Panel>
          <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-3">
            <Field label="Filtro mes" tooltip="Muestra solo compras del mes seleccionado."><select className={inputClass} value={month} onChange={(e) => setMonth(Number(e.target.value))}>{monthNames.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}</select></Field>
            <Field label="Filtro empresa" tooltip="Muestra compras de una empresa especifica o todas."><select className={inputClass} value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}><option value="all">Todas las empresas</option>{empresas.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></Field>
            <Field label="Filtro tipo" tooltip="Filtra por compras ingresadas con IVA incluido o sin IVA incluido."><select className={inputClass} value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="all">Todos los tipos</option><option value="iva_incluido">Con IVA incluido</option><option value="sin_iva">Sin IVA incluido</option></select></Field>
          </div>
          <div className="overflow-visible md:overflow-x-auto xl:overflow-visible"><table className="tablet-card-table tablet-table w-full min-w-[980px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="py-2"><TooltipLabel tooltip="Fecha registrada para la compra.">Fecha</TooltipLabel></th><th><TooltipLabel tooltip="Proveedor asociado a la compra.">Empresa</TooltipLabel></th><th className="tablet-optional"><TooltipLabel tooltip="Monto original que ingresaste.">Monto ingresado</TooltipLabel></th><th className="tablet-optional"><TooltipLabel tooltip="Indica si el monto tenia IVA incluido o no.">Tipo</TooltipLabel></th><th><TooltipLabel tooltip="Monto neto calculado sin IVA.">Monto sin IVA</TooltipLabel></th><th><TooltipLabel tooltip="IVA de la compra calculado automaticamente.">IVA compra</TooltipLabel></th><th><TooltipLabel tooltip="Total con IVA calculado automaticamente.">Total con IVA</TooltipLabel></th><th className="tablet-actions text-right"><TooltipLabel tooltip="Editar o eliminar la compra.">Acciones</TooltipLabel></th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.id}><td className="py-3" data-label="Fecha">{formatDate(item.fecha)}</td><td className="tablet-card-primary font-medium text-slate-950" data-label="Empresa">{empresas.find((e) => e.id === item.empresaId)?.nombre}</td><td className="tablet-optional" data-label="Monto ingresado">{formatearMoneda(item.montoIngresado, config)}</td><td className="tablet-optional" data-label="Tipo">{item.tipo === 'iva_incluido' ? 'Con IVA incluido' : 'Sin IVA incluido'}</td><td data-label="Monto sin IVA">{formatearMoneda(item.montoSinIVA, config)}</td><td data-label="IVA compra">{formatearMoneda(item.iva, config)}</td><td data-label="Total con IVA">{formatearMoneda(item.montoTotal, config)}</td><td className="tablet-card-actions text-right" data-label="Acciones"><span className="inline-flex items-center gap-2"><button className={secondaryButtonClass} onClick={() => setForm(item)}><Edit2 size={15} /></button><InfoTooltip text="Carga esta compra en el formulario para modificarla." /></span><span className="ml-2 inline-flex items-center gap-2"><button className={dangerButtonClass} onClick={() => void removeCompra(item.id)}><Trash2 size={15} /></button><InfoTooltip text="Elimina definitivamente esta compra del control local." /></span></td></tr>)}</tbody></table></div>
        </Panel>
      </div>
    </>
  )
}
