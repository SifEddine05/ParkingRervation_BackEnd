-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "wilaya" TEXT NOT NULL,
    "commune" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parking" (
    "id" SERIAL NOT NULL,
    "photo" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "addressId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "nbrTotalPlaces" INTEGER NOT NULL,
    "nbrDisponiblePlaces" INTEGER NOT NULL,

    CONSTRAINT "Parking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "reservationRandomId" TEXT NOT NULL,
    "dateAndTimeReservation" TIMESTAMP(3) NOT NULL,
    "nbrHours" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "userId" INTEGER NOT NULL,
    "parkingId" INTEGER NOT NULL,
    "dateAndTimeDebut" TIMESTAMP(3) NOT NULL,
    "position" TEXT NOT NULL,
    "qRcode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "place" INTEGER NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "seen" BOOLEAN NOT NULL,
    "dateAndTimeNotification" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Parking" ADD CONSTRAINT "Parking_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_parkingId_fkey" FOREIGN KEY ("parkingId") REFERENCES "Parking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
