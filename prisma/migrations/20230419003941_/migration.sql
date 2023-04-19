-- DropForeignKey
ALTER TABLE "Country" DROP CONSTRAINT "Country_gameStateId_fkey";

-- DropForeignKey
ALTER TABLE "GameState" DROP CONSTRAINT "GameState_playerCountryId_fkey";

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_gameStateId_fkey" FOREIGN KEY ("gameStateId") REFERENCES "GameState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameState" ADD CONSTRAINT "GameState_playerCountryId_fkey" FOREIGN KEY ("playerCountryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
