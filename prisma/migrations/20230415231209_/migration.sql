-- AlterTable
ALTER TABLE "GameState" ADD COLUMN     "playerCountryId" INTEGER;

-- AddForeignKey
ALTER TABLE "GameState" ADD CONSTRAINT "GameState_playerCountryId_fkey" FOREIGN KEY ("playerCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
