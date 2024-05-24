/*
  Warnings:

  - You are about to drop the column `nbrDisponiblePlaces` on the `Parking` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the `Place` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pricePerHour` to the `Parking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parkingId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_parkingId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_placeId_fkey";

-- AlterTable
ALTER TABLE "Parking" DROP COLUMN "nbrDisponiblePlaces",
ADD COLUMN     "pricePerHour" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "placeId",
ADD COLUMN     "parkingId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Place";

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_parkingId_fkey" FOREIGN KEY ("parkingId") REFERENCES "Parking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
