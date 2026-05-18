CREATE TYPE "CompraTipo" AS ENUM ('iva_incluido', 'sin_iva');

CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Compra" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "empresaId" TEXT NOT NULL,
    "montoIngresado" DECIMAL(14,2) NOT NULL,
    "tipo" "CompraTipo" NOT NULL,
    "numero" TEXT,
    "descripcion" TEXT,
    "montoSinIVA" DECIMAL(14,2) NOT NULL,
    "iva" DECIMAL(14,2) NOT NULL,
    "montoTotal" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Venta" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "montoTotal" DECIMAL(14,2) NOT NULL,
    "ventaSinIVA" DECIMAL(14,2) NOT NULL,
    "iva" DECIMAL(14,2) NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "nombreNegocio" TEXT NOT NULL DEFAULT 'Mi negocio',
    "tasaIVA" DECIMAL(6,2) NOT NULL DEFAULT 22,
    "moneda" TEXT NOT NULL DEFAULT 'UYU',
    "redondearDecimales" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Compra" ADD CONSTRAINT "Compra_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
