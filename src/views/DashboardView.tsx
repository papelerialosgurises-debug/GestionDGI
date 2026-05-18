import { useMemo, useState } from 'react'
import { Charts } from '../components/Charts'
import { ExportButton } from '../components/ExportButton'
import { Field, Panel, SectionHeader, TooltipLabel, inputClass } from '../components/ui'
import { useAppStore } from '../store/useAppStore'
import { currentMonth, currentYear, monthNames } from '../utils/date'
import { formatearMoneda } from '../utils/format'
import { calcularResumenMensual, interpretarSaldo } from '../utils/tax'

export function DashboardView() {
  const { compras, ventas, empresas, config } = useAppStore()
  const [month, setMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())
  const resumen = useMemo(() => calcularResumenMensual(compras, ventas, month, year), [compras, ventas, month, year])
  const cards = [
    ['Ventas totales', resumen.ventasTotales, 'Suma de ventas del mes con IVA incluido.'],
    ['Ventas sin IVA', resumen.ventasSinIVA, 'Total vendido sin el IVA incluido.'],
    ['IVA ventas', resumen.ivaVentas, 'IVA generado por ventas. Se compara contra el IVA de compras.'],
    ['Compras totales', resumen.comprasTotales, 'Suma de compras del mes con IVA incluido.'],
    ['Compras sin IVA', resumen.comprasSinIVA, 'Total comprado sin el IVA incluido.'],
    ['IVA compras', resumen.ivaCompras, 'IVA de compras usado como credito fiscal estimado.'],
    ['Saldo IVA', resumen.saldoIVA, 'Resultado de IVA ventas menos IVA compras. Mantiene el signo real.'],
  ]

  return (
    <>
      <SectionHeader
        title="Dashboard"
        subtitle="Vista rapida mensual de compras, ventas e IVA estimado."
        tooltip="Resultado estimado para control interno. No genera declaraciones oficiales."
        action={<ExportButton month={month} year={year} />}
      />
      <Panel className="mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Mes" tooltip="Elegir el mes que queres analizar en el dashboard.">
            <select className={inputClass} value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {monthNames.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ano" tooltip="Elegir el ano fiscal del periodo que queres revisar.">
            <input className={inputClass} type="number" value={year} onChange={(event) => setYear(Number(event.target.value))} />
          </Field>
          <div className={`rounded-lg border p-3 ${resumen.saldoIVA > 0 ? 'border-red-200 bg-red-50' : resumen.saldoIVA < 0 ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-slate-50'}`}>
            <p className={`text-sm ${resumen.saldoIVA === 0 ? 'text-slate-500' : 'text-red-700'}`}>
              <TooltipLabel tooltip="Indica si el mes da IVA estimado a pagar, credito fiscal estimado o saldo cero.">
                {interpretarSaldo(resumen.saldoIVA)}
              </TooltipLabel>
            </p>
            <p className={`mt-1 text-xl font-semibold ${resumen.saldoIVA === 0 ? 'text-slate-950' : 'text-red-700'}`}>{formatearMoneda(resumen.saldoIVA, config)}</p>
          </div>
        </div>
      </Panel>
      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, tooltip]) => (
          <Panel key={label as string}>
            <p className="text-sm text-slate-500">
              <TooltipLabel tooltip={tooltip as string}>{label}</TooltipLabel>
            </p>
            <p className={`mt-2 text-xl font-semibold md:text-2xl ${label === 'Saldo IVA' && (value as number) !== 0 ? 'text-red-700' : 'text-slate-950'}`}>
              {formatearMoneda(value as number, config)}
            </p>
          </Panel>
        ))}
      </div>
      <Charts compras={compras} ventas={ventas} empresas={empresas} month={month} year={year} config={config} />
    </>
  )
}
