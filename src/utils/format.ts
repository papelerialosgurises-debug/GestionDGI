import type { AppConfig } from '../types'

const safeNumber = (value: number) => (Number.isFinite(value) ? value : 0)
const safeDecimals = (value: number) => Math.min(Math.max(Math.trunc(Number.isFinite(value) ? value : 2), 0), 4)

export const formatearMoneda = (value: number, config: AppConfig) => {
  const decimales = safeDecimals(config.decimales)
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: config.moneda || 'UYU',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(safeNumber(value))
}

export const formatNumber = (value: number, decimales = 2) =>
  new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: safeDecimals(decimales),
    maximumFractionDigits: safeDecimals(decimales),
  }).format(safeNumber(value))
