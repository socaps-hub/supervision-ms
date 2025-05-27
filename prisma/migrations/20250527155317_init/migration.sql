-- CreateEnum
CREATE TYPE "ResFaseI" AS ENUM ('C', 'I', 'NA');

-- CreateEnum
CREATE TYPE "ResFaseII" AS ENUM ('S', 'NS');

-- CreateEnum
CREATE TYPE "ResFaseIII" AS ENUM ('C', 'I', 'NA', 'P');

-- CreateEnum
CREATE TYPE "Calificativo" AS ENUM ('CORRECTO', 'ACEPTABLE', 'DEFICIENTE', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "Resolucion" AS ENUM ('DEVUELTA', 'PASA_COMITE');

-- CreateTable
CREATE TABLE "Prestamo" (
    "R01NUM" CHAR(8) NOT NULL,
    "R01Suc_id" UUID NOT NULL,
    "R01Nso" CHAR(6) NOT NULL,
    "R01Nom" TEXT NOT NULL,
    "R01Cat_id" UUID NOT NULL,
    "R01Pro_id" UUID NOT NULL,
    "R01Imp" DECIMAL NOT NULL,
    "R01Dir" CHAR(2) NOT NULL,
    "R01SP_id" UUID NOT NULL,
    "R01Ejvo_id" UUID NOT NULL,
    "R01Fsol" TIMESTAMP(3) NOT NULL,
    "R01FRec" TIMESTAMP(3) NOT NULL,
    "R01FRev" TIMESTAMP(3) NOT NULL,
    "R01FMov" TIMESTAMP(3) NOT NULL,
    "R01ObsA" TEXT,
    "R01ObsM" TEXT,
    "R01ObsB" TEXT,
    "R01ObsT" TEXT,
    "R01Est" TEXT NOT NULL,
    "R01Activ" BOOLEAN NOT NULL,

    CONSTRAINT "Prestamo_pkey" PRIMARY KEY ("R01NUM")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "R02Id" UUID NOT NULL,
    "R02Nom" TEXT NOT NULL,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("R02Id")
);

-- CreateTable
CREATE TABLE "Rubro" (
    "R03Id" UUID NOT NULL,
    "R03G_id" UUID NOT NULL,
    "R03Nom" TEXT NOT NULL,

    CONSTRAINT "Rubro_pkey" PRIMARY KEY ("R03Id")
);

-- CreateTable
CREATE TABLE "Elemento" (
    "R04Id" UUID NOT NULL,
    "R04R_id" UUID NOT NULL,
    "R04Nom" TEXT NOT NULL,
    "R04Imp" TEXT NOT NULL,

    CONSTRAINT "Elemento_pkey" PRIMARY KEY ("R04Id")
);

-- CreateTable
CREATE TABLE "EvaluacionFase1" (
    "R05Id" UUID NOT NULL,
    "R05P_num" CHAR(8) NOT NULL,
    "R05E_id" UUID NOT NULL,
    "R05Res" "ResFaseI" NOT NULL DEFAULT 'NA',
    "R05Ev_por" UUID NOT NULL,
    "R05Ev_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluacionFase1_pkey" PRIMARY KEY ("R05Id")
);

-- CreateTable
CREATE TABLE "EvaluacionResumenFase1" (
    "R06P_num" CHAR(8) NOT NULL,
    "R06Ha" INTEGER NOT NULL,
    "R06Hm" INTEGER NOT NULL,
    "R06Hb" INTEGER NOT NULL,
    "R06Rc" INTEGER NOT NULL,
    "R06Cal" "Calificativo" NOT NULL,
    "R06Res" "Resolucion" NOT NULL,

    CONSTRAINT "EvaluacionResumenFase1_pkey" PRIMARY KEY ("R06P_num")
);

-- CreateTable
CREATE TABLE "EvaluacionFase2" (
    "R07Id" UUID NOT NULL,
    "R07P_num" CHAR(8) NOT NULL,
    "R07E_id" UUID NOT NULL,
    "R07Res" "ResFaseII" NOT NULL,
    "R07Obs" TEXT,
    "R07Ev_por" UUID NOT NULL,
    "R07Ev_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluacionFase2_pkey" PRIMARY KEY ("R07Id")
);

-- CreateTable
CREATE TABLE "EvaluacionResumenFase2" (
    "R08P_num" CHAR(8) NOT NULL,
    "R08SolvT" INTEGER NOT NULL,
    "R08SolvA" INTEGER NOT NULL,
    "R08SolvM" INTEGER NOT NULL,
    "R08SolvB" INTEGER NOT NULL,
    "R08Rc" INTEGER NOT NULL,
    "R08Cal" "Calificativo" NOT NULL,
    "R08Res" "Resolucion" NOT NULL,

    CONSTRAINT "EvaluacionResumenFase2_pkey" PRIMARY KEY ("R08P_num")
);

-- CreateTable
CREATE TABLE "EvaluacionFase3" (
    "R09Id" UUID NOT NULL,
    "R09P_num" CHAR(8) NOT NULL,
    "R09E_id" UUID NOT NULL,
    "R09Res" "ResFaseIII" NOT NULL,
    "R09Obs" TEXT,
    "R09Ev_por" UUID NOT NULL,
    "R09Ev_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluacionFase3_pkey" PRIMARY KEY ("R09Id")
);

-- CreateTable
CREATE TABLE "EvaluacionResumenFase3" (
    "R10P_num" CHAR(8) NOT NULL,
    "R10Ha" INTEGER NOT NULL,
    "R10Pendientes" INTEGER NOT NULL,
    "R10Rc" INTEGER NOT NULL,
    "R10Cal" "Calificativo" NOT NULL,

    CONSTRAINT "EvaluacionResumenFase3_pkey" PRIMARY KEY ("R10P_num")
);

-- CreateTable
CREATE TABLE "Sucursal" (
    "R11Id" UUID NOT NULL,
    "R11Nom" TEXT NOT NULL,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("R11Id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "R12Id" UUID NOT NULL,
    "R12Nom" TEXT NOT NULL,
    "R12Suc_id" UUID NOT NULL,
    "R12Rol" TEXT NOT NULL,
    "R12Activ" BOOLEAN NOT NULL,
    "R12Creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("R12Id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "R13Id" UUID NOT NULL,
    "R13Nom" TEXT NOT NULL,
    "R13Cat_id" UUID NOT NULL,
    "R13Activ" BOOLEAN NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("R13Id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "R14Id" UUID NOT NULL,
    "R14Nom" TEXT NOT NULL,
    "R14Activ" BOOLEAN NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("R14Id")
);

-- CreateTable
CREATE TABLE "EvaluacionFase4" (
    "R15Id" UUID NOT NULL,
    "R15P_num" CHAR(8) NOT NULL,
    "R15E_id" UUID NOT NULL,
    "R15Res" "ResFaseII" NOT NULL,
    "R15Obs" TEXT,
    "R15Ev_por" UUID NOT NULL,
    "R15Ev_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluacionFase4_pkey" PRIMARY KEY ("R15Id")
);

-- CreateTable
CREATE TABLE "EvaluacionResumenFase4" (
    "R16P_num" CHAR(8) NOT NULL,
    "R16SolvT" INTEGER NOT NULL,
    "R16SolvA" INTEGER NOT NULL,
    "R16SolvM" INTEGER NOT NULL,
    "R16SolvB" INTEGER NOT NULL,
    "R16SegCal" "Calificativo" NOT NULL,
    "R16HaSolv" INTEGER NOT NULL,
    "R16PenCu" INTEGER NOT NULL,
    "R16RcF" INTEGER NOT NULL,
    "R16DesCal" "Calificativo" NOT NULL,
    "R16CalF" "Calificativo" NOT NULL,

    CONSTRAINT "EvaluacionResumenFase4_pkey" PRIMARY KEY ("R16P_num")
);

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_R01Suc_id_fkey" FOREIGN KEY ("R01Suc_id") REFERENCES "Sucursal"("R11Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_R01SP_id_fkey" FOREIGN KEY ("R01SP_id") REFERENCES "Usuario"("R12Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_R01Ejvo_id_fkey" FOREIGN KEY ("R01Ejvo_id") REFERENCES "Usuario"("R12Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_R01Pro_id_fkey" FOREIGN KEY ("R01Pro_id") REFERENCES "Producto"("R13Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_R01Cat_id_fkey" FOREIGN KEY ("R01Cat_id") REFERENCES "Categoria"("R14Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rubro" ADD CONSTRAINT "Rubro_R03G_id_fkey" FOREIGN KEY ("R03G_id") REFERENCES "Grupo"("R02Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Elemento" ADD CONSTRAINT "Elemento_R04R_id_fkey" FOREIGN KEY ("R04R_id") REFERENCES "Rubro"("R03Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase1" ADD CONSTRAINT "EvaluacionFase1_R05P_num_fkey" FOREIGN KEY ("R05P_num") REFERENCES "Prestamo"("R01NUM") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase1" ADD CONSTRAINT "EvaluacionFase1_R05E_id_fkey" FOREIGN KEY ("R05E_id") REFERENCES "Elemento"("R04Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase1" ADD CONSTRAINT "EvaluacionFase1_R05Ev_por_fkey" FOREIGN KEY ("R05Ev_por") REFERENCES "Usuario"("R12Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionResumenFase1" ADD CONSTRAINT "EvaluacionResumenFase1_R06P_num_fkey" FOREIGN KEY ("R06P_num") REFERENCES "Prestamo"("R01NUM") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase2" ADD CONSTRAINT "EvaluacionFase2_R07P_num_fkey" FOREIGN KEY ("R07P_num") REFERENCES "Prestamo"("R01NUM") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase2" ADD CONSTRAINT "EvaluacionFase2_R07E_id_fkey" FOREIGN KEY ("R07E_id") REFERENCES "Elemento"("R04Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase2" ADD CONSTRAINT "EvaluacionFase2_R07Ev_por_fkey" FOREIGN KEY ("R07Ev_por") REFERENCES "Usuario"("R12Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionResumenFase2" ADD CONSTRAINT "EvaluacionResumenFase2_R08P_num_fkey" FOREIGN KEY ("R08P_num") REFERENCES "Prestamo"("R01NUM") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase3" ADD CONSTRAINT "EvaluacionFase3_R09P_num_fkey" FOREIGN KEY ("R09P_num") REFERENCES "Prestamo"("R01NUM") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase3" ADD CONSTRAINT "EvaluacionFase3_R09E_id_fkey" FOREIGN KEY ("R09E_id") REFERENCES "Elemento"("R04Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase3" ADD CONSTRAINT "EvaluacionFase3_R09Ev_por_fkey" FOREIGN KEY ("R09Ev_por") REFERENCES "Usuario"("R12Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionResumenFase3" ADD CONSTRAINT "EvaluacionResumenFase3_R10P_num_fkey" FOREIGN KEY ("R10P_num") REFERENCES "Prestamo"("R01NUM") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_R12Suc_id_fkey" FOREIGN KEY ("R12Suc_id") REFERENCES "Sucursal"("R11Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_R13Cat_id_fkey" FOREIGN KEY ("R13Cat_id") REFERENCES "Categoria"("R14Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase4" ADD CONSTRAINT "EvaluacionFase4_R15P_num_fkey" FOREIGN KEY ("R15P_num") REFERENCES "Prestamo"("R01NUM") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase4" ADD CONSTRAINT "EvaluacionFase4_R15E_id_fkey" FOREIGN KEY ("R15E_id") REFERENCES "Elemento"("R04Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionFase4" ADD CONSTRAINT "EvaluacionFase4_R15Ev_por_fkey" FOREIGN KEY ("R15Ev_por") REFERENCES "Usuario"("R12Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionResumenFase4" ADD CONSTRAINT "EvaluacionResumenFase4_R16P_num_fkey" FOREIGN KEY ("R16P_num") REFERENCES "Prestamo"("R01NUM") ON DELETE RESTRICT ON UPDATE CASCADE;
