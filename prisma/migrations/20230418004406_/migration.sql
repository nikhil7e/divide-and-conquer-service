-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "conqueredCountryId" INTEGER;

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_conqueredCountryId_fkey" FOREIGN KEY ("conqueredCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
