/*
  Warnings:

  - Added the required column `R01Actualizado_en` to the `R01Prestamo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `R02Actualizado_en` to the `R02Grupo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `R03Actualizado_en` to the `R03Rubro` table without a default value. This is not possible if the table is not empty.
  - Added the required column `R04Actualizado_en` to the `R04Elemento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `R11Actualizado_en` to the `R11Sucursal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `R12Actualizado_en` to the `R12Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `R13Actualizado_en` to the `R13Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `R14Actualizado_en` to the `R14Categoria` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "R01Prestamo" ADD COLUMN     "R01Actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "R01Creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "R02Grupo" ADD COLUMN     "R02Actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "R02Creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "R03Rubro" ADD COLUMN     "R03Actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "R03Creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "R04Elemento" ADD COLUMN     "R04Actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "R04Creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "R11Sucursal" ADD COLUMN     "R11Actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "R11Creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "R12Usuario" ADD COLUMN     "R12Actualizado_en" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "R13Producto" ADD COLUMN     "R13Actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "R13Creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "R14Categoria" ADD COLUMN     "R14Actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "R14Creada_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
