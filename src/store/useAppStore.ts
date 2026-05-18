import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { demoCompras, demoEmpresas, demoVentas } from '../data/demoData'
import type { AppConfig, Compra, Empresa, Venta } from '../types'
import { calcularCompraConIVAIncluido, calcularCompraSinIVAIncluido, calcularVentaConIVAIncluido } from '../utils/tax'

type State = {
  isAuthenticated: boolean
  empresas: Empresa[]
  compras: Compra[]
  ventas: Venta[]
  config: AppConfig
  login: (password: string) => boolean
  logout: () => void
  addEmpresa: (empresa: Empresa) => void
  updateEmpresa: (empresa: Empresa) => void
  deleteEmpresa: (id: string) => void
  addCompra: (compra: Compra) => void
  updateCompra: (compra: Compra) => void
  deleteCompra: (id: string) => void
  addVenta: (venta: Venta) => void
  updateVenta: (venta: Venta) => void
  deleteVenta: (id: string) => void
  updateConfig: (config: AppConfig) => void
  loadDemoData: () => void
  clearBusinessData: () => void
}

const INITIAL_PASSWORD = '43823225'

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

const normalizePersistedState = (value: unknown) => {
  const source = isObject(value) ? value : {}
  const config = normalizeConfig(source.config)
  return {
    isAuthenticated: Boolean(source.isAuthenticated),
    empresas: normalizeEmpresas(source.empresas),
    compras: normalizeCompras(source.compras, config),
    ventas: normalizeVentas(source.ventas, config),
    config,
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
      // Proteccion basica local. Esto NO es autenticacion segura real ni reemplaza un backend.
      login: (password) => {
        const ok = password === INITIAL_PASSWORD
        if (ok) set({ isAuthenticated: true })
        return ok
      },
      logout: () => set({ isAuthenticated: false }),
      addEmpresa: (empresa) => set({ empresas: [empresa, ...get().empresas] }),
      updateEmpresa: (empresa) => set({ empresas: get().empresas.map((item) => (item.id === empresa.id ? empresa : item)) }),
      deleteEmpresa: (id) =>
        set({
          empresas: get().empresas.filter((item) => item.id !== id),
          compras: get().compras.filter((item) => item.empresaId !== id),
        }),
      addCompra: (compra) => set({ compras: [compra, ...get().compras] }),
      updateCompra: (compra) => set({ compras: get().compras.map((item) => (item.id === compra.id ? compra : item)) }),
      deleteCompra: (id) => set({ compras: get().compras.filter((item) => item.id !== id) }),
      addVenta: (venta) => set({ ventas: [venta, ...get().ventas] }),
      updateVenta: (venta) => set({ ventas: get().ventas.map((item) => (item.id === venta.id ? venta : item)) }),
      deleteVenta: (id) => set({ ventas: get().ventas.filter((item) => item.id !== id) }),
      updateConfig: (config) => set({ config }),
      loadDemoData: () => set({ empresas: demoEmpresas, compras: demoCompras, ventas: demoVentas }),
      clearBusinessData: () => set({ empresas: [], compras: [], ventas: [] }),
    }),
    {
      name: 'control-iva-uy-local',
      version: 2,
      migrate: (persistedState) => normalizePersistedState(persistedState),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedState(persistedState),
      }),
    },
  ),
)
