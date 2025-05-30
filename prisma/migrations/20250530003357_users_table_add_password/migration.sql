/*
  Warnings:

  - Added the required column `R12Password` to the `R12Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "R12Usuario" ADD COLUMN     "R12Password" TEXT NOT NULL;
