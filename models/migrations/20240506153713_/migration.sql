/*
  Warnings:

  - You are about to drop the column `pricePerHour` on the `Parking` table. All the data in the column will be lost.
  - You are about to drop the column `parkingId` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `place` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `placeId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_parkingId_fkey";

-- AlterTable
ALTER TABLE "Parking" DROP COLUMN "pricePerHour";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "parkingId",
DROP COLUMN "place",
ADD COLUMN     "placeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Place" (
    "id" SERIAL NOT NULL,
    "parkingId" INTEGER NOT NULL,
    "floor" INTEGER NOT NULL,
    "isCovered" BOOLEAN NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "isReserved" BOOLEAN NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_parkingId_fkey" FOREIGN KEY ("parkingId") REFERENCES "Parking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
