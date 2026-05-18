# Control IVA Uruguay

Aplicacion web local para control administrativo y estimacion simple de IVA de un negocio en Uruguay.

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
- Persistencia local con `localStorage` mediante Zustand.
- Datos demo opcionales desde Configuracion.

## Acceso

Contrasena inicial:

```txt
43823225
```

Esta proteccion es solo local y no es autenticacion segura real.

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Ejecutar Vite:

```bash
npm run dev
```

Luego abrir la URL que indique Vite, normalmente:

```txt
http://localhost:5173
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

## Docker

El proyecto incluye un `Dockerfile` multi-stage:

- Etapa 1: Node compila React/Vite.
- Etapa 2: Nginx sirve los archivos estaticos de `dist`.

Construir imagen:

```bash
docker build -t control-iva-app .
```

Ejecutar contenedor:

```bash
docker run -d --name control-iva-app -p 8085:80 --restart unless-stopped control-iva-app
```

Ver logs:

```bash
docker logs -f control-iva-app
```

Detener y eliminar el contenedor:

```bash
docker stop control-iva-app
docker rm control-iva-app
```

## Docker Compose

Crear archivo `.env` a partir del ejemplo si queres cambiar el puerto:

```bash
cp .env.example .env
```

Levantar en segundo plano:

```bash
docker compose up -d --build
```

Abrir:

```txt
http://localhost:8085
```

Ver logs:

```bash
docker logs -f control-iva-app
```

Detener:

```bash
docker compose down
```

Reconstruir despues de cambios:

```bash
docker compose up -d --build
```

## Cambiar puerto

Editar `.env`:

```env
APP_PORT=8085
```

Por ejemplo, para usar el puerto `8090`:

```env
APP_PORT=8090
```

Luego reconstruir o reiniciar:

```bash
docker compose up -d --build
```

## Nginx

La configuracion `nginx.conf` esta preparada para SPA:

- `try_files` hace fallback a `index.html`.
- Permite refresh en rutas internas.
- Sirve assets estaticos con cache.
- Agrega headers basicos de seguridad.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```
