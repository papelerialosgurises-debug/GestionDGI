import { useMemo, useState } from 'react'
import { ExportButton } from '../components/ExportButton'
import { Field, Panel, SectionHeader, TooltipLabel, inputClass } from '../components/ui'
import { useAppStore } from '../store/useAppStore'
import { currentMonth, currentYear, monthNames } from '../utils/date'
import { formatearMoneda } from '../utils/format'
import { calcularResumenMensual, interpretarSaldo } from '../utils/tax'

export function LiquidacionView() {
  const { compras, ventas, config } = useAppStore()
  const [month, setMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())
  const resumen = useMemo(() => calcularResumenMensual(compras, ventas, month, year), [compras, ventas, month, year])
  const rows = [
    ['IVA ventas', resumen.ivaVentas, 'IVA generado por las ventas del mes.'],
    ['IVA compras', resumen.ivaCompras, 'IVA de compras del mes usado como credito fiscal estimado.'],
    ['Saldo IVA', resumen.saldoIVA, 'IVA ventas menos IVA compras. Si es negativo, se muestra con signo menos.'],
    ['Total ventas con IVA', resumen.ventasTotales, 'Suma de ventas del mes con IVA incluido.'],
    ['Total ventas sin IVA', resumen.ventasSinIVA, 'Ventas netas del mes, sin IVA.'],
    ['Total compras con IVA', resumen.comprasTotales, 'Suma de compras del mes con IVA incluido.'],
    ['Total compras sin IVA', resumen.comprasSinIVA, 'Compras netas del mes, sin IVA.'],
    ['Cantidad de compras', resumen.cantidadCompras, 'Numero de compras registradas en el mes.'],
    ['Cantidad de ventas', resumen.cantidadVentas, 'Numero de ventas registradas en el mes.'],
  ]

  return (
    <>
      <SectionHeader title="Liquidacion mensual" subtitle="Resumen especial para estimar saldo mensual de IVA." tooltip="Resultado estimado entre IVA ventas e IVA compras." action={<ExportButton month={month} year={year} />} />
      <Panel className="mb-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Mes" tooltip="Elegir el mes que queres liquidar de forma estimada."><select className={inputClass} value={month} onChange={(e) => setMonth(Number(e.target.value))}>{monthNames.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}</select></Field>
          <Field label="Ano" tooltip="Elegir el ano del periodo mensual a revisar."><input className={inputClass} type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} /></Field>
        </div>
      </Panel>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel>
          <div className="divide-y divide-slate-100">
            {rows.map(([label, value, tooltip]) => (
              <div key={label as string} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="text-slate-600"><TooltipLabel tooltip={tooltip as string}>{label}</TooltipLabel></span>
                <strong className={label === 'Saldo IVA' && (value as number) !== 0 ? 'text-red-700' : 'text-slate-950'}>{typeof value === 'number' && String(label).startsWith('Cantidad') ? value : formatearMoneda(value as number, config)}</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className={resumen.saldoIVA > 0 ? 'border-red-200 bg-red-50' : resumen.saldoIVA < 0 ? 'border-orange-200 bg-orange-50' : 'bg-slate-50'}>
          <p className="text-sm font-medium text-slate-600">
            <TooltipLabel tooltip="Resultado final de restar IVA compras al IVA ventas del mes.">Resultado final</TooltipLabel>
          </p>
          <h2 className="mt-3 text-xl font-semibold text-slate-950 md:text-2xl">{interpretarSaldo(resumen.saldoIVA)}</h2>
          <p className={`mt-4 text-2xl font-bold md:text-3xl ${resumen.saldoIVA === 0 ? 'text-slate-950' : 'text-red-700'}`}>{formatearMoneda(resumen.saldoIVA, config)}</p>
          <p className="mt-4 text-xs leading-5 text-slate-500">Estimacion interna para control administrativo. No reemplaza asesoramiento profesional ni presentaciones oficiales.</p>
        </Panel>
      </div>
    </>
  )
}
