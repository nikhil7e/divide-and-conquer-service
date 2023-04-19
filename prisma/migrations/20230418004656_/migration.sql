/*
  Warnings:

  - You are about to drop the column `conqueringCountryIds` on the `Country` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Country" DROP COLUMN "conqueringCountryIds",
ADD COLUMN     "conqueredCountryIds" INTEGER[];
