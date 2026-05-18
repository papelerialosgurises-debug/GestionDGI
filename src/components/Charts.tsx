import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Compra, Empresa, Venta, AppConfig } from '../types'
import { monthNames } from '../utils/date'
import { formatearMoneda } from '../utils/format'
import { calcularResumenMensual } from '../utils/tax'
import { Panel, TooltipLabel } from './ui'

export function Charts({
  compras,
  ventas,
  empresas,
  month,
  year,
  config,
}: {
  compras: Compra[]
  ventas: Venta[]
  empresas: Empresa[]
  month: number
  year: number
  config: AppConfig
}) {
  const resumen = calcularResumenMensual(compras, ventas, month, year)
  const barData = [{ name: monthNames[month - 1], 'IVA ventas': resumen.ivaVentas, 'IVA compras': resumen.ivaCompras }]
  const lineData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(year, month - 6 + index, 1)
    const summary = calcularResumenMensual(compras, ventas, date.getMonth() + 1, date.getFullYear())
    return { name: `${monthNames[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`, saldo: summary.saldoIVA }
  })
  const providerTotals = empresas
    .map((empresa) => ({
      name: empresa.nombre,
      value: compras.filter((compra) => compra.empresaId === empresa.id).reduce((acc, compra) => acc + compra.montoTotal, 0),
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
  const typeData = [
    { name: 'Con IVA incluido', value: compras.filter((item) => item.tipo === 'iva_incluido').reduce((acc, item) => acc + item.montoTotal, 0) },
    { name: 'Sin IVA incluido', value: compras.filter((item) => item.tipo === 'sin_iva').reduce((acc, item) => acc + item.montoTotal, 0) },
  ]
  const colors = ['#0f172a', '#2563eb', '#059669', '#dc2626', '#7c3aed']

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          <TooltipLabel tooltip="Compara el IVA generado por ventas contra el IVA de compras del mes elegido.">IVA ventas vs IVA compras</TooltipLabel>
        </h3>
        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatearMoneda(Number(value), config)} />
              <Bar dataKey="IVA ventas" fill="#0f172a" radius={[6, 6, 0, 0]} />
              <Bar dataKey="IVA compras" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          <TooltipLabel tooltip="Muestra como evoluciono el saldo IVA de los ultimos meses. Si baja de cero, queda como credito fiscal estimado.">Evolucion mensual del saldo IVA</TooltipLabel>
        </h3>
        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => formatearMoneda(Number(value), config)} />
              <Line type="monotone" dataKey="saldo" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          <TooltipLabel tooltip="Distribuye el total comprado por proveedor para identificar a quien se le compra mas.">Empresas a las que mas se compra</TooltipLabel>
        </h3>
        <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
          <div className="h-64 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={providerTotals.slice(0, 5)} dataKey="value" nameKey="name" outerRadius={95} innerRadius={52}>
                  {providerTotals.slice(0, 5).map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatearMoneda(Number(value), config)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0 xl:block xl:space-y-2">
            {providerTotals.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 truncate">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <strong className="shrink-0 text-slate-950">{formatearMoneda(item.value, config)}</strong>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          <TooltipLabel tooltip="Compara compras ingresadas como monto total con IVA contra compras ingresadas como monto neto sin IVA.">Compras con IVA incluido vs sin IVA incluido</TooltipLabel>
        </h3>
        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(value) => `${value / 1000}k`} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={130} />
              <Tooltip formatter={(value) => formatearMoneda(Number(value), config)} />
              <Bar dataKey="value" fill="#059669" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  )
}
