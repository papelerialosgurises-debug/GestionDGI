import type { AppConfig } from '../types'

export const formatearMoneda = (value: number, config: AppConfig) =>
  new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: config.moneda || 'UYU',
    minimumFractionDigits: config.decimales,
    maximumFractionDigits: config.decimales,
  }).format(value || 0)

export const formatNumber = (value: number, decimales = 2) =>
  new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(value || 0)
