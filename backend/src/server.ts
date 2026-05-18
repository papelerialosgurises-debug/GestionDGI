import cors from 'cors'
import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const port = Number(process.env.PORT ?? 3001)

app.use(cors())
app.use(express.json({ limit: '2mb' }))

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toString = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : value == null ? fallback : String(value)

const toNullableString = (value: unknown) => {
  const text = toString(value).trim()
  return text || null
}

const toDate = (value: unknown) => {
  const text = toString(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error('Fecha invalida')
  const date = new Date(`${text}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) throw new Error('Fecha invalida')
  return date
}

const dateToInput = (date: Date) => date.toISOString().slice(0, 10)
const decimalToNumber = (value: { toNumber: () => number }) => value.toNumber()

const defaultConfig = {
  id: 'default',
  nombreNegocio: 'Mi negocio',
  tasaIVA: 22,
  moneda: 'UYU',
  redondearDecimales: 2,
}

const serializeConfig = (config: { id: string; nombreNegocio: string; tasaIVA: { toNumber: () => number }; moneda: string; redondearDecimales: number }) => ({
  id: config.id,
  nombreNegocio: config.nombreNegocio,
  tasaIVA: decimalToNumber(config.tasaIVA),
  moneda: config.moneda,
  decimales: config.redondearDecimales,
})

const getConfig = () =>
  prisma.config.upsert({
    where: { id: 'default' },
    create: defaultConfig,
    update: {},
  })

const serializeEmpresa = (empresa: Awaited<ReturnType<typeof prisma.empresa.findMany>>[number]) => ({
  id: empresa.id,
  nombre: empresa.nombre,
  rut: empresa.rut ?? '',
  direccion: empresa.direccion ?? '',
  telefono: empresa.telefono ?? '',
  email: empresa.email ?? '',
  notas: empresa.notas ?? '',
  creadaEn: empresa.createdAt.toISOString(),
})

const serializeCompra = (compra: Awaited<ReturnType<typeof prisma.compra.findMany>>[number]) => ({
  id: compra.id,
  fecha: dateToInput(compra.fecha),
  empresaId: compra.empresaId,
  montoIngresado: decimalToNumber(compra.montoIngresado),
  tipo: compra.tipo,
  numero: compra.numero ?? '',
  descripcion: compra.descripcion ?? '',
  montoSinIVA: decimalToNumber(compra.montoSinIVA),
  iva: decimalToNumber(compra.iva),
  montoTotal: decimalToNumber(compra.montoTotal),
})

const serializeVenta = (venta: Awaited<ReturnType<typeof prisma.venta.findMany>>[number]) => ({
  id: venta.id,
  fecha: dateToInput(venta.fecha),
  montoTotal: decimalToNumber(venta.montoTotal),
  descripcion: venta.descripcion ?? '',
  ventaSinIVA: decimalToNumber(venta.ventaSinIVA),
  iva: decimalToNumber(venta.iva),
})

const compraData = (body: Record<string, unknown>) => ({
  fecha: toDate(body.fecha),
  empresaId: toString(body.empresaId),
  montoIngresado: toNumber(body.montoIngresado),
  tipo: body.tipo === 'sin_iva' ? 'sin_iva' as const : 'iva_incluido' as const,
  numero: toNullableString(body.numero),
  descripcion: toNullableString(body.descripcion),
  montoSinIVA: toNumber(body.montoSinIVA),
  iva: toNumber(body.iva),
  montoTotal: toNumber(body.montoTotal),
})

const ventaData = (body: Record<string, unknown>) => ({
  fecha: toDate(body.fecha),
  montoTotal: toNumber(body.montoTotal),
  ventaSinIVA: toNumber(body.ventaSinIVA),
  iva: toNumber(body.iva),
  descripcion: toNullableString(body.descripcion),
})

const asyncRoute =
  (handler: express.RequestHandler): express.RequestHandler =>
  (request, response, next) =>
    Promise.resolve(handler(request, response, next)).catch(next)

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.get('/api/empresas', asyncRoute(async (_request, response) => {
  const empresas = await prisma.empresa.findMany({ orderBy: { nombre: 'asc' } })
  response.json(empresas.map(serializeEmpresa))
}))

app.post('/api/empresas', asyncRoute(async (request, response) => {
  const empresa = await prisma.empresa.create({
    data: {
      id: toNullableString(request.body.id) ?? undefined,
      nombre: toString(request.body.nombre).trim(),
      rut: toNullableString(request.body.rut),
      direccion: toNullableString(request.body.direccion),
      telefono: toNullableString(request.body.telefono),
      email: toNullableString(request.body.email),
      notas: toNullableString(request.body.notas),
    },
  })
  response.status(201).json(serializeEmpresa(empresa))
}))

app.put('/api/empresas/:id', asyncRoute(async (request, response) => {
  const empresa = await prisma.empresa.update({
    where: { id: request.params.id },
    data: {
      nombre: toString(request.body.nombre).trim(),
      rut: toNullableString(request.body.rut),
      direccion: toNullableString(request.body.direccion),
      telefono: toNullableString(request.body.telefono),
      email: toNullableString(request.body.email),
      notas: toNullableString(request.body.notas),
    },
  })
  response.json(serializeEmpresa(empresa))
}))

app.delete('/api/empresas/:id', asyncRoute(async (request, response) => {
  await prisma.empresa.delete({ where: { id: request.params.id } })
  response.status(204).end()
}))

app.get('/api/compras', asyncRoute(async (_request, response) => {
  const compras = await prisma.compra.findMany({ orderBy: { fecha: 'desc' } })
  response.json(compras.map(serializeCompra))
}))

app.post('/api/compras', asyncRoute(async (request, response) => {
  const compra = await prisma.compra.create({
    data: { id: toNullableString(request.body.id) ?? undefined, ...compraData(request.body) },
  })
  response.status(201).json(serializeCompra(compra))
}))

app.put('/api/compras/:id', asyncRoute(async (request, response) => {
  const compra = await prisma.compra.update({ where: { id: request.params.id }, data: compraData(request.body) })
  response.json(serializeCompra(compra))
}))

app.delete('/api/compras/:id', asyncRoute(async (request, response) => {
  await prisma.compra.delete({ where: { id: request.params.id } })
  response.status(204).end()
}))

app.get('/api/ventas', asyncRoute(async (_request, response) => {
  const ventas = await prisma.venta.findMany({ orderBy: { fecha: 'desc' } })
  response.json(ventas.map(serializeVenta))
}))

app.post('/api/ventas', asyncRoute(async (request, response) => {
  const venta = await prisma.venta.create({
    data: { id: toNullableString(request.body.id) ?? undefined, ...ventaData(request.body) },
  })
  response.status(201).json(serializeVenta(venta))
}))

app.put('/api/ventas/:id', asyncRoute(async (request, response) => {
  const venta = await prisma.venta.update({ where: { id: request.params.id }, data: ventaData(request.body) })
  response.json(serializeVenta(venta))
}))

app.delete('/api/ventas/:id', asyncRoute(async (request, response) => {
  await prisma.venta.delete({ where: { id: request.params.id } })
  response.status(204).end()
}))

app.get('/api/config', asyncRoute(async (_request, response) => {
  response.json(serializeConfig(await getConfig()))
}))

app.put('/api/config', asyncRoute(async (request, response) => {
  const decimales = Math.min(Math.max(Math.trunc(toNumber(request.body.decimales, 2)), 0), 4)
  const config = await prisma.config.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      nombreNegocio: toString(request.body.nombreNegocio, 'Mi negocio') || 'Mi negocio',
      tasaIVA: toNumber(request.body.tasaIVA, 22),
      moneda: toString(request.body.moneda, 'UYU') || 'UYU',
      redondearDecimales: decimales,
    },
    update: {
      nombreNegocio: toString(request.body.nombreNegocio, 'Mi negocio') || 'Mi negocio',
      tasaIVA: toNumber(request.body.tasaIVA, 22),
      moneda: toString(request.body.moneda, 'UYU') || 'UYU',
      redondearDecimales: decimales,
    },
  })
  response.json(serializeConfig(config))
}))

app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
  void next
  console.error(error)
  const message = error instanceof Error ? error.message : 'Error interno'
  response.status(400).json({ error: message })
})

app.listen(port, '0.0.0.0', () => {
  console.log(`GestionDGI API escuchando en puerto ${port}`)
})
