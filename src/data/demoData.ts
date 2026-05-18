import type { Compra, Empresa, Venta } from '../types'
import { calcularCompraConIVAIncluido, calcularCompraSinIVAIncluido, calcularVentaConIVAIncluido } from '../utils/tax'

const now = new Date().toISOString()

export const demoEmpresas: Empresa[] = [
  {
    id: 'emp-1',
    nombre: 'Papeleria Centro',
    rut: '217845620014',
    direccion: '18 de Julio 1240, Montevideo',
    telefono: '2901 3322',
    email: 'ventas@papeleriacentro.uy',
    notas: 'Insumos de oficina',
    creadaEn: now,
  },
  {
    id: 'emp-2',
    nombre: 'Distribuidora Sur',
    rut: '218904560012',
    direccion: 'Av. Italia 3321',
    telefono: '2604 8811',
    email: 'cuentas@sur.uy',
    notas: 'Mercaderia para reventa',
    creadaEn: now,
  },
  {
    id: 'emp-3',
    nombre: 'Servicios Contables Prado',
    rut: '216703410019',
    direccion: 'Agraciada 4100',
    telefono: '2309 4430',
    email: 'admin@prado.uy',
    notas: 'Servicios profesionales',
    creadaEn: now,
  },
]

const compra = (
  id: string,
  fecha: string,
  empresaId: string,
  montoIngresado: number,
  tipo: Compra['tipo'],
  numero: string,
  descripcion: string,
): Compra => {
  const calculo =
    tipo === 'iva_incluido'
      ? calcularCompraConIVAIncluido(montoIngresado, 22, 2)
      : calcularCompraSinIVAIncluido(montoIngresado, 22, 2)

  return { id, fecha, empresaId, montoIngresado, tipo, numero, descripcion, ...calculo }
}

const venta = (id: string, fecha: string, montoTotal: number, descripcion: string): Venta => ({
  id,
  fecha,
  montoTotal,
  descripcion,
  ...calcularVentaConIVAIncluido(montoTotal, 22, 2),
})

export const demoCompras: Compra[] = [
  compra('com-1', '2026-01-05', 'emp-1', 12200, 'iva_incluido', 'A-1020', 'Utiles y papeleria'),
  compra('com-2', '2026-01-18', 'emp-2', 31000, 'sin_iva', 'B-889', 'Mercaderia enero'),
  compra('com-3', '2026-02-03', 'emp-3', 9760, 'iva_incluido', 'E-442', 'Honorarios administrativos'),
  compra('com-4', '2026-02-20', 'emp-2', 27450, 'iva_incluido', 'B-901', 'Reposicion de stock'),
  compra('com-5', '2026-03-07', 'emp-1', 8200, 'sin_iva', 'A-1112', 'Insumos oficina'),
  compra('com-6', '2026-03-19', 'emp-2', 42100, 'iva_incluido', 'B-924', 'Mercaderia marzo'),
  compra('com-7', '2026-04-08', 'emp-3', 12200, 'iva_incluido', 'E-501', 'Soporte administrativo'),
  compra('com-8', '2026-05-10', 'emp-2', 35500, 'sin_iva', 'B-960', 'Mercaderia mayo'),
]

export const demoVentas: Venta[] = [
  venta('ven-1', '2026-01-12', 59800, 'Ventas mostrador enero'),
  venta('ven-2', '2026-01-28', 34200, 'Ventas online enero'),
  venta('ven-3', '2026-02-14', 76750, 'Ventas mostrador febrero'),
  venta('ven-4', '2026-03-02', 45100, 'Ventas primera quincena'),
  venta('ven-5', '2026-03-26', 52800, 'Ventas cierre marzo'),
  venta('ven-6', '2026-04-18', 68400, 'Ventas abril'),
  venta('ven-7', '2026-05-09', 47200, 'Ventas mayo'),
]
