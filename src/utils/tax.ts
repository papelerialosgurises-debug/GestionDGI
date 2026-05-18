import type { Compra, MonthlySummary, Venta } from '../types'
import { isInMonth } from './date'

export const roundTo = (value: number, decimals = 2) => {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

const rateFactor = (tasaIVA: number) => 1 + tasaIVA / 100

export const calcularCompraConIVAIncluido = (montoTotal: number, tasaIVA = 22, decimales = 2) => {
  const montoSinIVA = roundTo(montoTotal / rateFactor(tasaIVA), decimales)
  const iva = roundTo(montoTotal - montoSinIVA, decimales)
  return {
    montoSinIVA,
    iva,
    montoTotal: roundTo(montoTotal, decimales),
  }
}

export const calcularCompraSinIVAIncluido = (montoSinIVA: number, tasaIVA = 22, decimales = 2) => {
  const iva = roundTo(montoSinIVA * (tasaIVA / 100), decimales)
  const montoTotal = roundTo(montoSinIVA + iva, decimales)
  return {
    montoSinIVA: roundTo(montoSinIVA, decimales),
    iva,
    montoTotal,
  }
}

export const calcularVentaConIVAIncluido = (ventaTotal: number, tasaIVA = 22, decimales = 2) => {
  const ventaSinIVA = roundTo(ventaTotal / rateFactor(tasaIVA), decimales)
  const iva = roundTo(ventaTotal - ventaSinIVA, decimales)
  return {
    ventaSinIVA,
    iva,
  }
}

export const calcularResumenMensual = (compras: Compra[], ventas: Venta[], month: number, year: number): MonthlySummary => {
  const comprasMes = compras.filter((item) => isInMonth(item.fecha, month, year))
  const ventasMes = ventas.filter((item) => isInMonth(item.fecha, month, year))
  const sum = <T>(items: T[], selector: (item: T) => number) => roundTo(items.reduce((acc, item) => acc + selector(item), 0), 2)

  const ivaVentas = sum(ventasMes, (item) => item.iva)
  const ivaCompras = sum(comprasMes, (item) => item.iva)

  return {
    ventasTotales: sum(ventasMes, (item) => item.montoTotal),
    ventasSinIVA: sum(ventasMes, (item) => item.ventaSinIVA),
    ivaVentas,
    comprasTotales: sum(comprasMes, (item) => item.montoTotal),
    comprasSinIVA: sum(comprasMes, (item) => item.montoSinIVA),
    ivaCompras,
    saldoIVA: roundTo(ivaVentas - ivaCompras, 2),
    cantidadCompras: comprasMes.length,
    cantidadVentas: ventasMes.length,
  }
}

export const interpretarSaldo = (saldoIVA: number) => {
  if (saldoIVA > 0) return 'IVA estimado a pagar'
  if (saldoIVA < 0) return 'Credito fiscal estimado'
  return 'Sin saldo estimado'
}
