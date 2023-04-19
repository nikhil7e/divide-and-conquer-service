/*
  Warnings:

  - You are about to drop the column `conqueredCountryId` on the `Country` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Country" DROP CONSTRAINT "Country_conqueredCountryId_fkey";

-- AlterTable
ALTER TABLE "Country" DROP COLUMN "conqueredCountryId";
