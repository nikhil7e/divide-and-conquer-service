/*
  Warnings:

  - Added the required column `troops` to the `Country` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "allyCountryIds" INTEGER[],
ADD COLUMN     "enemyCountryIds" INTEGER[],
ADD COLUMN     "troops" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "_relationships" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_relationships_AB_unique" ON "_relationships"("A", "B");

-- CreateIndex
CREATE INDEX "_relationships_B_index" ON "_relationships"("B");

-- AddForeignKey
ALTER TABLE "_relationships" ADD CONSTRAINT "_relationships_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_relationships" ADD CONSTRAINT "_relationships_B_fkey" FOREIGN KEY ("B") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
