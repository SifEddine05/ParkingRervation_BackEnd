const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const prisma = require("../models/prisma.client");
const { v4: uuidv4 } = require('uuid');
const qr = require('qrcode'); // Import the qrcode library
const fs = require('fs');
const path = require('path');
async function createReservation(req, res, next) {
    try {
        const { parkingId, nbrHours, dateAndTimeDebut } = req.body;
        const userId = req.user.id;

        const availablePlace = await prisma.place.findFirst({
            where: {
                parkingId: parkingId,
                isReserved: false // Check if the place is not reserved
            }
        });

        if (!availablePlace) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: ReasonPhrases.BAD_REQUEST, message: "No available places in the specified parking" });
        }

        // Mark the place as reserved
        await prisma.place.update({
            where: { id: availablePlace.id },
            data: { isReserved: true }
        });

        

        // Calculate total price (assuming pricePerHour is available in the place)
        const totalPrice = nbrHours * availablePlace.pricePerHour;

        const reservationId = uuidv4();
        const qrCode = await qr.toDataURL(reservationId);
        const uploadDir = path.join(__dirname, '../uploads/qrcodes');
        const qrCodeImagePath = `${uploadDir}/${reservationId}.png`; // Example: /path/to/uploads/uuid.png
        const qrCodeImageUrl = `${req.protocol}://${req.get('host')}/uploads/qrcodes/${reservationId}.png`;

        // Save the QR code image to a file
        await fs.promises.writeFile(qrCodeImagePath, qrCode.split(';base64,').pop(), { encoding: 'base64' });
        // Create the reservation
        const reservation = await prisma.reservation.create({
            data: {
                reservationRandomId: reservationId,
                userId: userId,
                placeId: availablePlace.id,
                dateAndTimeReservation: new Date(),
                nbrHours: nbrHours,
                totalPrice: totalPrice,
                dateAndTimeDebut: new Date(dateAndTimeDebut),
                position: "", // assuming it's empty for now
                qRcode: qrCodeImageUrl, // Assign the generated QR code
                status: "active"
            }
        });

        // Decrease the number of available places in the parking
        await prisma.parking.update({
          where: { id: parkingId },
          data: {
              nbrDisponiblePlaces: {
                  decrement: 1
              }
          }
      });

        res.status(StatusCodes.CREATED).json(reservation);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createReservation
}
