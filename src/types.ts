export type CompraTipo = 'iva_incluido' | 'sin_iva'

export type Empresa = {
  id: string
  nombre: string
  rut?: string
  direccion?: string
  telefono?: string
  email?: string
  notas?: string
  creadaEn: string
}

export type Compra = {
  id: string
  fecha: string
  empresaId: string
  montoIngresado: number
  tipo: CompraTipo
  numero?: string
  descripcion?: string
  montoSinIVA: number
  iva: number
  montoTotal: number
}

export type Venta = {
  id: string
  fecha: string
  montoTotal: number
  descripcion?: string
  ventaSinIVA: number
  iva: number
}

export type AppConfig = {
  tasaIVA: number
  moneda: string
  nombreNegocio: string
  decimales: number
}

export type MonthlySummary = {
  ventasTotales: number
  ventasSinIVA: number
  ivaVentas: number
  comprasTotales: number
  comprasSinIVA: number
  ivaCompras: number
  saldoIVA: number
  cantidadCompras: number
  cantidadVentas: number
}

export type ViewKey =
  | 'dashboard'
  | 'empresas'
  | 'compras'
  | 'ventas'
  | 'liquidacion'
  | 'exportaciones'
  | 'configuracion'
