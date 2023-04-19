/*
  Warnings:

  - You are about to drop the `_QuestionToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `featureClass` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `population` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_QuestionToUser" DROP CONSTRAINT "_QuestionToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToUser" DROP CONSTRAINT "_QuestionToUser_B_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "answeredUserIds" INTEGER[],
ADD COLUMN     "featureClass" TEXT NOT NULL,
ADD COLUMN     "population" INTEGER NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "answeredQuestionIds" INTEGER[],
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- DropTable
DROP TABLE "_QuestionToUser";

-- CreateTable
CREATE TABLE "_Questions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Questions_AB_unique" ON "_Questions"("A", "B");

-- CreateIndex
CREATE INDEX "_Questions_B_index" ON "_Questions"("B");

-- AddForeignKey
ALTER TABLE "_Questions" ADD CONSTRAINT "_Questions_A_fkey" FOREIGN KEY ("A") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Questions" ADD CONSTRAINT "_Questions_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
