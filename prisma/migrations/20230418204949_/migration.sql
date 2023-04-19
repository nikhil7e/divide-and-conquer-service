/*
  Warnings:

  - A unique constraint covering the columns `[name,gameStateId]` on the table `Country` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Country_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_gameStateId_key" ON "Country"("name", "gameStateId");
