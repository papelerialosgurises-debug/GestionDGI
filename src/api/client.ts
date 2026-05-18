import type { AppConfig, Compra, Empresa, Venta } from '../types'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error ?? `Error HTTP ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
  getEmpresas: () => request<Empresa[]>('/empresas'),
  createEmpresa: (empresa: Empresa) => request<Empresa>('/empresas', { method: 'POST', body: JSON.stringify(empresa) }),
  updateEmpresa: (empresa: Empresa) => request<Empresa>(`/empresas/${empresa.id}`, { method: 'PUT', body: JSON.stringify(empresa) }),
  deleteEmpresa: (id: string) => request<void>(`/empresas/${id}`, { method: 'DELETE' }),

  getCompras: () => request<Compra[]>('/compras'),
  createCompra: (compra: Compra) => request<Compra>('/compras', { method: 'POST', body: JSON.stringify(compra) }),
  updateCompra: (compra: Compra) => request<Compra>(`/compras/${compra.id}`, { method: 'PUT', body: JSON.stringify(compra) }),
  deleteCompra: (id: string) => request<void>(`/compras/${id}`, { method: 'DELETE' }),

  getVentas: () => request<Venta[]>('/ventas'),
  createVenta: (venta: Venta) => request<Venta>('/ventas', { method: 'POST', body: JSON.stringify(venta) }),
  updateVenta: (venta: Venta) => request<Venta>(`/ventas/${venta.id}`, { method: 'PUT', body: JSON.stringify(venta) }),
  deleteVenta: (id: string) => request<void>(`/ventas/${id}`, { method: 'DELETE' }),

  getConfig: () => request<AppConfig>('/config'),
  updateConfig: (config: AppConfig) => request<AppConfig>('/config', { method: 'PUT', body: JSON.stringify(config) }),
}
