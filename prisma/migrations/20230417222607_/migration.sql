-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "conqueringCountryId" INTEGER,
ADD COLUMN     "conqueringCountryIds" INTEGER[];

-- AddForeignKey
ALTER TABLE "Country" ADD CONSTRAINT "Country_conqueringCountryId_fkey" FOREIGN KEY ("conqueringCountryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
