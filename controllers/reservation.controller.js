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

        const parking = await prisma.parking.findUnique({
            where: {
                id: parkingId,
            }
        });

        if (!parking) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error:  "No Parking with  this ID" });
        }
        
        // Calculate total price (assuming pricePerHour is available in the place)
        const totalPrice = nbrHours * parking.pricePerHour;

        const reservationId = uuidv4();
        const qrCode = await qr.toDataURL(reservationId);
        const uploadDir = path.join(__dirname, '../uploads/qrcodes');
        const qrCodeImagePath = `${uploadDir}/${reservationId}.png`; // Example: /path/to/uploads/uuid.png
        const qrCodeImageUrl = `${req.protocol}://${req.get('host')}/uploads/qrcodes/${reservationId}.png`;

        // Save the QR code image to a file
        await fs.promises.writeFile(qrCodeImagePath, qrCode.split(';base64,').pop(), { encoding: 'base64' });
        function generateRandomPosition() {
            const letters = "ABCDEF";
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            const randomNumber = Math.floor(Math.random() * 9) + 1;
            return `${randomLetter}-${randomNumber}`;
          }
        // Create the reservation
        const reservation = await prisma.reservation.create({
            data: {
                reservationRandomId: reservationId,
                userId: userId,
                parkingId: parking.id,
                dateAndTimeReservation: new Date(),
                nbrHours: nbrHours,
                totalPrice: totalPrice,
                dateAndTimeDebut: new Date(dateAndTimeDebut),
                position: generateRandomPosition(), 
                qRcode: qrCodeImageUrl, 
                status: "active"
            }
        });
        res.status(StatusCodes.CREATED).json(reservation);
    } catch (error) {
        res.status(500).json("Server Error");
    }
}

module.exports = {
    createReservation
}
