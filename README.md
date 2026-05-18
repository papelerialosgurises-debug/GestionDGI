# Control IVA Uruguay

Aplicacion web para control administrativo y estimacion simple de IVA de un negocio en Uruguay.

No integra APIs reales de DGI, no genera declaraciones oficiales y no reemplaza asesoramiento profesional. Es una herramienta interna para comparar IVA ventas contra IVA compras.

## Funcionalidades

- Login local simple con solo contrasena.
- Empresas/proveedores con buscador.
- Compras con IVA incluido o sin IVA incluido.
- Ventas ingresadas siempre con IVA incluido.
- Dashboard mensual con tarjetas, indicadores y graficas.
- Liquidacion mensual estimada.
- Exportacion a Excel con `exceljs`.
- Configuracion de tasa IVA, moneda, nombre del negocio y decimales.
- Persistencia centralizada en PostgreSQL mediante backend Node/Express y Prisma.
- Datos demo opcionales desde Configuracion.
- Importacion opcional de datos antiguos guardados en `localStorage`.

## Acceso

Contrasena inicial:

```txt
43823225
```

Esta proteccion sigue siendo basica y no reemplaza autenticacion real con usuarios, sesiones seguras y permisos.

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Ejecutar Vite:

```bash
npm run dev
```

En otra terminal, configurar y ejecutar el backend:

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

Para desarrollo local el backend necesita una base PostgreSQL y `DATABASE_URL`, por ejemplo:

```env
DATABASE_URL=postgresql://gestiondgi:gestiondgi_password@localhost:5432/gestiondgi?schema=public
```

Luego abrir la URL que indique Vite, normalmente:

```txt
http://localhost:5173
```

Si el backend local corre en otro origen, crear `.env` en la raiz:

```env
VITE_API_URL=http://localhost:3001/api
```

## Build de produccion

Compilar TypeScript y generar `dist`:

```bash
npm run build
```

Previsualizar el build localmente:

```bash
npm run preview
```

Validar lint:

```bash
npm run lint
```

Compilar backend:

```bash
cd backend
npm run build
```

## Docker

El proyecto incluye Docker Compose con tres servicios:

- `frontend`: React/Vite compilado y servido por Nginx.
- `backend`: Node.js + Express + Prisma.
- `db`: PostgreSQL con volumen persistente.

Levantar todo:

```bash
docker compose up -d --build
```

Abrir:

```txt
http://localhost:8095
```

Ver logs:

```bash
docker compose logs -f
```

Detener:

```bash
docker compose down
```

Los datos de PostgreSQL se mantienen en el volumen:

```txt
postgres_data
```

Crear archivo `.env` a partir del ejemplo si queres cambiar el puerto:

```bash
cp .env.example .env
```

Levantar en segundo plano:

```bash
docker compose up -d --build
```

Variables principales:

```env
FRONTEND_PORT=8095
POSTGRES_USER=gestiondgi
POSTGRES_PASSWORD=gestiondgi_password
POSTGRES_DB=gestiondgi
DATABASE_URL=postgresql://gestiondgi:gestiondgi_password@db:5432/gestiondgi?schema=public
VITE_API_URL=/api
```

El frontend usa `/api`; Nginx reenvia esas solicitudes al servicio `backend` dentro de Docker.

## Migrar datos locales antiguos

Si ya tenias datos cargados en un navegador antes de esta version, entrar a Configuracion y usar:

```txt
Importar datos locales al servidor
```

Esto lee el `localStorage` de ese navegador y envia empresas, compras, ventas y configuracion al backend.

## Cambiar puerto

Editar `.env`:

```env
FRONTEND_PORT=8095
```

Por ejemplo, para usar el puerto `8090`:

```env
FRONTEND_PORT=8090
```

Luego reconstruir o reiniciar:

```bash
docker compose up -d --build
```

## API

Endpoints principales:

```txt
GET    /api/empresas
POST   /api/empresas
PUT    /api/empresas/:id
DELETE /api/empresas/:id

GET    /api/compras
POST   /api/compras
PUT    /api/compras/:id
DELETE /api/compras/:id

GET    /api/ventas
POST   /api/ventas
PUT    /api/ventas/:id
DELETE /api/ventas/:id

GET    /api/config
PUT    /api/config
```

## Base de datos

Prisma define modelos para:

```txt
Empresa
Compra
Venta
Config
```

Las migraciones se aplican automaticamente al iniciar el contenedor backend:

```bash
npx prisma migrate deploy
```

## Nginx

La configuracion `nginx.conf` esta preparada para SPA y proxy de API:

- `try_files` hace fallback a `index.html`.
- Permite refresh en rutas internas.
- Sirve assets estaticos con cache.
- Reenvia `/api` al backend.
- Agrega headers basicos de seguridad.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Backend:

```bash
cd backend
npm run dev
npm run build
npm run prisma:generate
npm run prisma:migrate
```
