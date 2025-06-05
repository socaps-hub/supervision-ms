-- CreateTable
CREATE TABLE "R18LimitePrudencial" (
    "R18Id" UUID NOT NULL,
    "R18Importe" INTEGER NOT NULL,
    "R18Coop_id" UUID NOT NULL,
    "R18Creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "R18Actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "R18LimitePrudencial_pkey" PRIMARY KEY ("R18Id")
);

-- AddForeignKey
ALTER TABLE "R18LimitePrudencial" ADD CONSTRAINT "R18LimitePrudencial_R18Coop_id_fkey" FOREIGN KEY ("R18Coop_id") REFERENCES "R17Cooperativas"("R17Id") ON DELETE RESTRICT ON UPDATE CASCADE;
