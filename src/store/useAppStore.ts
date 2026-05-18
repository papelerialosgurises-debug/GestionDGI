import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { demoCompras, demoEmpresas, demoVentas } from '../data/demoData'
import type { AppConfig, Compra, Empresa, Venta } from '../types'

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
      version: 1,
    },
  ),
)
