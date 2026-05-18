import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../api/client'
import { demoCompras, demoEmpresas, demoVentas } from '../data/demoData'
import type { AppConfig, Compra, Empresa, Venta } from '../types'
import { calcularCompraConIVAIncluido, calcularCompraSinIVAIncluido, calcularVentaConIVAIncluido } from '../utils/tax'

type State = {
  isAuthenticated: boolean
  empresas: Empresa[]
  compras: Compra[]
  ventas: Venta[]
  config: AppConfig
  loading: boolean
  error: string
  login: (password: string) => boolean
  logout: () => void
  loadServerData: () => Promise<void>
  addEmpresa: (empresa: Empresa) => Promise<void>
  updateEmpresa: (empresa: Empresa) => Promise<void>
  deleteEmpresa: (id: string) => Promise<void>
  addCompra: (compra: Compra) => Promise<void>
  updateCompra: (compra: Compra) => Promise<void>
  deleteCompra: (id: string) => Promise<void>
  addVenta: (venta: Venta) => Promise<void>
  updateVenta: (venta: Venta) => Promise<void>
  deleteVenta: (id: string) => Promise<void>
  updateConfig: (config: AppConfig) => Promise<void>
  loadDemoData: () => Promise<void>
  clearBusinessData: () => Promise<void>
  importLocalDataToServer: () => Promise<void>
  clearError: () => void
}

const INITIAL_PASSWORD = '43823225'
const LEGACY_STORAGE_KEY = 'control-iva-uy-local'

export const defaultConfig: AppConfig = {
  tasaIVA: 22,
  moneda: 'UYU',
  nombreNegocio: 'Mi negocio',
  decimales: 2,
}

const today = () => new Date().toISOString().slice(0, 10)

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const stringValue = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : value == null ? fallback : String(value)

const numberValue = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const dateValue = (value: unknown) => {
  const raw = stringValue(value, today())
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) && !Number.isNaN(new Date(`${raw}T00:00:00`).getTime()) ? raw : today()
}

const normalizeConfig = (value: unknown): AppConfig => {
  const source = isObject(value) ? value : {}
  const decimales = Math.min(Math.max(Math.trunc(numberValue(source.decimales, defaultConfig.decimales)), 0), 4)
  const tasaIVA = numberValue(source.tasaIVA, defaultConfig.tasaIVA)
  return {
    tasaIVA: tasaIVA > 0 ? tasaIVA : defaultConfig.tasaIVA,
    moneda: stringValue(source.moneda, defaultConfig.moneda) || defaultConfig.moneda,
    nombreNegocio: stringValue(source.nombreNegocio, defaultConfig.nombreNegocio) || defaultConfig.nombreNegocio,
    decimales,
  }
}

const normalizeEmpresas = (value: unknown): Empresa[] =>
  Array.isArray(value)
    ? value.filter(isObject).map((item, index) => ({
        id: stringValue(item.id, crypto.randomUUID()),
        nombre: stringValue(item.nombre, `Empresa ${index + 1}`),
        rut: stringValue(item.rut),
        direccion: stringValue(item.direccion),
        telefono: stringValue(item.telefono),
        email: stringValue(item.email),
        notas: stringValue(item.notas),
        creadaEn: stringValue(item.creadaEn, new Date().toISOString()),
      }))
    : []

const normalizeCompras = (value: unknown, config: AppConfig): Compra[] =>
  Array.isArray(value)
    ? value.filter(isObject).map((item) => {
        const tipo = item.tipo === 'sin_iva' ? 'sin_iva' : 'iva_incluido'
        const montoIngresado = numberValue(item.montoIngresado)
        const calculo =
          tipo === 'iva_incluido'
            ? calcularCompraConIVAIncluido(montoIngresado, config.tasaIVA, config.decimales)
            : calcularCompraSinIVAIncluido(montoIngresado, config.tasaIVA, config.decimales)

        return {
          id: stringValue(item.id, crypto.randomUUID()),
          fecha: dateValue(item.fecha),
          empresaId: stringValue(item.empresaId),
          montoIngresado,
          tipo,
          numero: stringValue(item.numero),
          descripcion: stringValue(item.descripcion),
          montoSinIVA: numberValue(item.montoSinIVA, calculo.montoSinIVA),
          iva: numberValue(item.iva, calculo.iva),
          montoTotal: numberValue(item.montoTotal, calculo.montoTotal),
        }
      })
    : []

const normalizeVentas = (value: unknown, config: AppConfig): Venta[] =>
  Array.isArray(value)
    ? value.filter(isObject).map((item) => {
        const montoTotal = numberValue(item.montoTotal)
        const calculo = calcularVentaConIVAIncluido(montoTotal, config.tasaIVA, config.decimales)
        return {
          id: stringValue(item.id, crypto.randomUUID()),
          fecha: dateValue(item.fecha),
          montoTotal,
          descripcion: stringValue(item.descripcion),
          ventaSinIVA: numberValue(item.ventaSinIVA, calculo.ventaSinIVA),
          iva: numberValue(item.iva, calculo.iva),
        }
      })
    : []

const readLegacyLocalData = () => {
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (!raw) return { empresas: [], compras: [], ventas: [], config: defaultConfig }
  const parsed = JSON.parse(raw) as { state?: unknown }
  const state = isObject(parsed.state) ? parsed.state : {}
  const config = normalizeConfig(state.config)
  return {
    empresas: normalizeEmpresas(state.empresas),
    compras: normalizeCompras(state.compras, config),
    ventas: normalizeVentas(state.ventas, config),
    config,
  }
}

const runServerOperation = async (set: (partial: Partial<State>) => void, operation: () => Promise<void>) => {
  set({ error: '' })
  try {
    await operation()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo conectar con el servidor'
    set({ error: message })
    throw error
  }
}

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      empresas: [],
      compras: [],
      ventas: [],
      config: defaultConfig,
      loading: false,
      error: '',
      // Proteccion basica local. Esto NO es autenticacion segura real ni reemplaza un backend.
      login: (password) => {
        const ok = password === INITIAL_PASSWORD
        if (ok) set({ isAuthenticated: true })
        return ok
      },
      logout: () => set({ isAuthenticated: false }),
      loadServerData: async () => {
        set({ loading: true, error: '' })
        try {
          const [empresas, compras, ventas, config] = await Promise.all([
            api.getEmpresas(),
            api.getCompras(),
            api.getVentas(),
            api.getConfig(),
          ])
          set({ empresas, compras, ventas, config: normalizeConfig(config), loading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'No se pudo cargar informacion del servidor'
          set({ error: message, loading: false })
        }
      },
      addEmpresa: async (empresa) => runServerOperation(set, async () => {
        await api.createEmpresa(empresa)
        await get().loadServerData()
      }),
      updateEmpresa: async (empresa) => runServerOperation(set, async () => {
        await api.updateEmpresa(empresa)
        await get().loadServerData()
      }),
      deleteEmpresa: async (id) => runServerOperation(set, async () => {
        await api.deleteEmpresa(id)
        await get().loadServerData()
      }),
      addCompra: async (compra) => runServerOperation(set, async () => {
        await api.createCompra(compra)
        await get().loadServerData()
      }),
      updateCompra: async (compra) => runServerOperation(set, async () => {
        await api.updateCompra(compra)
        await get().loadServerData()
      }),
      deleteCompra: async (id) => runServerOperation(set, async () => {
        await api.deleteCompra(id)
        await get().loadServerData()
      }),
      addVenta: async (venta) => runServerOperation(set, async () => {
        await api.createVenta(venta)
        await get().loadServerData()
      }),
      updateVenta: async (venta) => runServerOperation(set, async () => {
        await api.updateVenta(venta)
        await get().loadServerData()
      }),
      deleteVenta: async (id) => runServerOperation(set, async () => {
        await api.deleteVenta(id)
        await get().loadServerData()
      }),
      updateConfig: async (config) => runServerOperation(set, async () => {
        await api.updateConfig(config)
        await get().loadServerData()
      }),
      loadDemoData: async () => runServerOperation(set, async () => {
        for (const empresa of demoEmpresas) await api.createEmpresa(empresa)
        for (const compra of demoCompras) await api.createCompra(compra)
        for (const venta of demoVentas) await api.createVenta(venta)
        await get().loadServerData()
      }),
      clearBusinessData: async () => runServerOperation(set, async () => {
        for (const compra of get().compras) await api.deleteCompra(compra.id)
        for (const venta of get().ventas) await api.deleteVenta(venta.id)
        for (const empresa of get().empresas) await api.deleteEmpresa(empresa.id)
        await get().loadServerData()
      }),
      importLocalDataToServer: async () => runServerOperation(set, async () => {
        const localData = readLegacyLocalData()
        await api.updateConfig(localData.config)
        for (const empresa of localData.empresas) await api.createEmpresa(empresa)
        for (const compra of localData.compras) await api.createCompra(compra)
        for (const venta of localData.ventas) await api.createVenta(venta)
        await get().loadServerData()
      }),
      clearError: () => set({ error: '' }),
    }),
    {
      name: 'control-iva-uy-auth',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    },
  ),
)
