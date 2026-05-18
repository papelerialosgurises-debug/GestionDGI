import ExcelJS from 'exceljs'
import type { AppConfig, Compra, Empresa, Venta } from '../types'
import { formatDate, isInDateRange, isInMonth, monthNames } from './date'
import { calcularResumenMensual, interpretarSaldo } from './tax'

type ExportScope = {
  month?: number
  year?: number
  fromMonth?: number
  toMonth?: number
  from?: string
  to?: string
}

const downloadWorkbook = async (workbook: ExcelJS.Workbook, filename: string) => {
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const styleSheet = (sheet: ExcelJS.Worksheet) => {
  sheet.views = [{ state: 'frozen', ySplit: 2 }]
  sheet.autoFilter = {
    from: { row: 2, column: 1 },
    to: { row: 2, column: sheet.columnCount },
  }
  sheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FF111827' } }
  sheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  sheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
  sheet.getRow(2).alignment = { vertical: 'middle' }
  sheet.columns.forEach((column) => {
    let max = 14
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const raw = cell.value instanceof Date ? 'DD/MM/YYYY' : String(cell.value ?? '')
      max = Math.max(max, raw.length + 4)
    })
    column.width = Math.min(Math.max(max, 16), 52)
  })
}

const moneyStyle = (currency: string) => `"${currency}" #,##0.00;-"${currency}" #,##0.00;"${currency}" 0.00`

const scopeLabel = (scope: ExportScope) => {
  if (scope.month && scope.year) return `${monthNames[scope.month - 1]} ${scope.year}`
  if (scope.fromMonth && scope.toMonth && scope.year) return `${monthNames[scope.fromMonth - 1]} a ${monthNames[scope.toMonth - 1]} ${scope.year}`
  if (scope.from || scope.to) return `${scope.from ? formatDate(scope.from) : 'inicio'} a ${scope.to ? formatDate(scope.to) : 'fin'}`
  return 'todos los datos'
}

const fileName = (scope: ExportScope) => {
  if (scope.month && scope.year) return `control_iva_${monthNames[scope.month - 1]}_${scope.year}.xlsx`
  if (scope.fromMonth && scope.toMonth && scope.year) return `control_iva_${monthNames[scope.fromMonth - 1]}_a_${monthNames[scope.toMonth - 1]}_${scope.year}.xlsx`
  if (scope.from || scope.to) return `control_iva_rango_${scope.from ?? 'inicio'}_${scope.to ?? 'fin'}.xlsx`
  return 'control_iva_completo.xlsx'
}

const isInScope = (date: string, scope: ExportScope) => {
  if (scope.month && scope.year) return isInMonth(date, scope.month, scope.year)
  if (scope.fromMonth && scope.toMonth && scope.year) {
    const value = new Date(`${date}T00:00:00`)
    const from = Math.min(scope.fromMonth, scope.toMonth)
    const to = Math.max(scope.fromMonth, scope.toMonth)
    return value.getFullYear() === scope.year && value.getMonth() + 1 >= from && value.getMonth() + 1 <= to
  }
  return isInDateRange(date, scope.from, scope.to)
}

const addTotalsRow = (sheet: ExcelJS.Worksheet, label: string, moneyColumns: number[]) => {
  const row = sheet.addRow([])
  row.getCell(1).value = label
  row.font = { bold: true }
  moneyColumns.forEach((column) => {
    const letter = sheet.getColumn(column).letter
    row.getCell(column).value = { formula: `SUM(${letter}3:${letter}${row.number - 1})` }
  })
}

export const exportarExcel = async (
  empresas: Empresa[],
  compras: Compra[],
  ventas: Venta[],
  config: AppConfig,
  scope: ExportScope,
) => {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Control IVA Uruguay'
  workbook.created = new Date()

  const filteredCompras = compras.filter((item) => isInScope(item.fecha, scope))
  const filteredVentas = ventas.filter((item) => isInScope(item.fecha, scope))
  const months = new Set([...filteredCompras, ...filteredVentas].map((item) => item.fecha.slice(0, 7)))
  const currencyStyle = moneyStyle(config.moneda || 'UYU')

  const resumenSheet = workbook.addWorksheet('Resumen mensual')
  resumenSheet.addRow([`Control IVA - ${config.nombreNegocio}`])
  resumenSheet.addRow(['Periodo', 'Ventas total', 'Ventas sin IVA', 'IVA ventas', 'Compras total', 'Compras sin IVA', 'IVA compras', 'Saldo IVA', 'Resultado final'])

  if (scope.month && scope.year) {
    const resumen = calcularResumenMensual(compras, ventas, scope.month, scope.year)
    resumenSheet.addRow([
      scopeLabel(scope),
      resumen.ventasTotales,
      resumen.ventasSinIVA,
      resumen.ivaVentas,
      resumen.comprasTotales,
      resumen.comprasSinIVA,
      resumen.ivaCompras,
      resumen.saldoIVA,
      interpretarSaldo(resumen.saldoIVA),
    ])
  } else {
    Array.from(months)
      .sort()
      .forEach((key) => {
        const [year, month] = key.split('-').map(Number)
        const resumen = calcularResumenMensual(compras, ventas, month, year)
        resumenSheet.addRow([
          `${monthNames[month - 1]} ${year}`,
          resumen.ventasTotales,
          resumen.ventasSinIVA,
          resumen.ivaVentas,
          resumen.comprasTotales,
          resumen.comprasSinIVA,
          resumen.ivaCompras,
          resumen.saldoIVA,
          interpretarSaldo(resumen.saldoIVA),
        ])
      })
  }
  ;[2, 3, 4, 5, 6, 7, 8].forEach((index) => (resumenSheet.getColumn(index).numFmt = currencyStyle))
  styleSheet(resumenSheet)

  const comprasSheet = workbook.addWorksheet('Compras')
  comprasSheet.addRow([`Compras - ${scopeLabel(scope)}`])
  comprasSheet.addRow(['Fecha', 'Empresa', 'RUT', 'Numero factura/boleta', 'Descripcion', 'Tipo de monto', 'Monto ingresado', 'Monto sin IVA', 'IVA compra', 'Total con IVA'])
  filteredCompras.forEach((item) => {
    const empresa = empresas.find((entry) => entry.id === item.empresaId)
    comprasSheet.addRow([
      new Date(`${item.fecha}T00:00:00`),
      empresa?.nombre ?? 'Sin empresa',
      empresa?.rut ?? '',
      item.numero ?? '',
      item.descripcion ?? '',
      item.tipo === 'iva_incluido' ? 'Con IVA incluido' : 'Sin IVA incluido',
      item.montoIngresado,
      item.montoSinIVA,
      item.iva,
      item.montoTotal,
    ])
  })
  comprasSheet.getColumn(1).numFmt = 'dd/mm/yyyy'
  ;[7, 8, 9, 10].forEach((index) => (comprasSheet.getColumn(index).numFmt = currencyStyle))
  addTotalsRow(comprasSheet, 'Totales', [7, 8, 9, 10])
  styleSheet(comprasSheet)

  const ventasSheet = workbook.addWorksheet('Ventas')
  ventasSheet.addRow([`Ventas - ${scopeLabel(scope)}`])
  ventasSheet.addRow(['Fecha', 'Descripcion', 'Total con IVA', 'Venta sin IVA', 'IVA venta'])
  filteredVentas.forEach((item) => ventasSheet.addRow([new Date(`${item.fecha}T00:00:00`), item.descripcion ?? '', item.montoTotal, item.ventaSinIVA, item.iva]))
  ventasSheet.getColumn(1).numFmt = 'dd/mm/yyyy'
  ;[3, 4, 5].forEach((index) => (ventasSheet.getColumn(index).numFmt = currencyStyle))
  addTotalsRow(ventasSheet, 'Totales', [3, 4, 5])
  styleSheet(ventasSheet)

  const empresasSheet = workbook.addWorksheet('Empresas')
  empresasSheet.addRow(['Empresas registradas'])
  empresasSheet.addRow(['Nombre', 'RUT', 'Direccion', 'Telefono', 'Email', 'Notas'])
  const relatedEmpresaIds = new Set(filteredCompras.map((item) => item.empresaId))
  empresas
    .filter((item) => relatedEmpresaIds.has(item.id) || !filteredCompras.length)
    .forEach((item) => empresasSheet.addRow([item.nombre, item.rut ?? '', item.direccion ?? '', item.telefono ?? '', item.email ?? '', item.notas ?? '']))
  styleSheet(empresasSheet)

  const liquidacionSheet = workbook.addWorksheet('Liquidacion estimada')
  const totals = filteredVentas.length || filteredCompras.length
    ? {
        ivaVentas: filteredVentas.reduce((acc, item) => acc + item.iva, 0),
        ivaCompras: filteredCompras.reduce((acc, item) => acc + item.iva, 0),
        ventasTotales: filteredVentas.reduce((acc, item) => acc + item.montoTotal, 0),
        ventasSinIVA: filteredVentas.reduce((acc, item) => acc + item.ventaSinIVA, 0),
        comprasTotales: filteredCompras.reduce((acc, item) => acc + item.montoTotal, 0),
        comprasSinIVA: filteredCompras.reduce((acc, item) => acc + item.montoSinIVA, 0),
      }
    : { ivaVentas: 0, ivaCompras: 0, ventasTotales: 0, ventasSinIVA: 0, comprasTotales: 0, comprasSinIVA: 0 }
  const saldo = totals.ivaVentas - totals.ivaCompras
  liquidacionSheet.addRow([`Liquidacion estimada - ${scopeLabel(scope)}`])
  liquidacionSheet.addRow(['Concepto', 'Importe'])
  ;[
    ['IVA ventas', totals.ivaVentas],
    ['IVA compras', totals.ivaCompras],
    ['Saldo IVA', saldo],
    ['Resultado final', interpretarSaldo(saldo)],
    ['Total ventas con IVA', totals.ventasTotales],
    ['Total ventas sin IVA', totals.ventasSinIVA],
    ['Total compras con IVA', totals.comprasTotales],
    ['Total compras sin IVA', totals.comprasSinIVA],
    ['Aclaracion', 'Estimacion interna para control administrativo. No reemplaza asesoramiento profesional ni presentaciones oficiales.'],
  ].forEach((row) => liquidacionSheet.addRow(row))
  liquidacionSheet.getColumn(2).numFmt = currencyStyle
  styleSheet(liquidacionSheet)

  await downloadWorkbook(workbook, fileName(scope))
}
