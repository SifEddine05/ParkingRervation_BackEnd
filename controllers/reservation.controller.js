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
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "No Parking with this ID" });
        }

        // Calculate the end time of the requested reservation
        const requestedEndTime = new Date(dateAndTimeDebut);
        requestedEndTime.setHours(requestedEndTime.getHours() + nbrHours);

        // Fetch all active reservations for the parking lot
        const activeReservations = await prisma.reservation.findMany({
            where: {
                parkingId: parkingId,
                status: "active",
            }
        });

        // Check if the number of active reservations at the requested time is less than the total number of places
        let overlappingReservationsCount = 0;
        for (const reservation of activeReservations) {
            const reservationEndTime = new Date(reservation.dateAndTimeDebut);
            reservationEndTime.setHours(reservationEndTime.getHours() + reservation.nbrHours);

            // Check if the requested time overlaps with existing reservations
            if (
                (new Date(dateAndTimeDebut) < reservationEndTime) &&
                (requestedEndTime > new Date(reservation.dateAndTimeDebut))
            ) {
                overlappingReservationsCount++;
            }
        }

        if (overlappingReservationsCount >= parking.nbrTotalPlaces) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "No place available" });
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





async function getMyActiveReservations(req, res, next) {
    try {
        const userId = req.user.id;
        const currentDateTime = new Date();

        // Fetch active reservations for the user
        let activeReservations = await prisma.reservation.findMany({
            where: {
                userId: userId,
                status: "active",
            },
        });

        // Update status for expired reservations
        const updatedReservations = await Promise.all(activeReservations.map(async (reservation) => {
            const reservationEndDateTime = new Date(reservation.dateAndTimeDebut);
            reservationEndDateTime.setHours(reservationEndDateTime.getHours() + reservation.nbrHours);

            if (reservationEndDateTime < currentDateTime) {
                // Update the reservation status to expired
                await prisma.reservation.update({
                    where: {
                        id: reservation.id,
                    },
                    data: {
                        status: "expired",
                    },
                });

                return null; // Exclude expired reservation from the result
            }

            return reservation;
        }));

        // Filter out null values (expired reservations)
        activeReservations = updatedReservations.filter(reservation => reservation !== null);

        res.status(StatusCodes.OK).json(activeReservations);
    } catch (error) {
        res.status(500).json("Server Error");
    }
}


async function getMyExpiredReservations(req, res, next) {
    try {
        const userId = req.user.id;
        const currentDateTime = new Date();

        // Fetch active reservations for the user
        const activeReservations = await prisma.reservation.findMany({
            where: {
                userId: userId,
                status: "active",
            },
        });

        // Update status for expired active reservations
        const updatedReservations = await Promise.all(activeReservations.map(async (reservation) => {
            const reservationEndTime = new Date(reservation.dateAndTimeDebut);
            reservationEndTime.setHours(reservationEndTime.getHours() + reservation.nbrHours);

            if (reservationEndTime < currentDateTime) {
                // Update the reservation status to expired
                await prisma.reservation.update({
                    where: {
                        id: reservation.id,
                    },
                    data: {
                        status: "expired",
                    },
                });

                return reservation; // Include expired reservation in the result
            }

            return null; // Exclude non-expired reservation from the result
        }));

        // Fetch all expired reservations for the user
        const expiredReservations = await prisma.reservation.findMany({
            where: {
                userId: userId,
                status: "expired",
            },
        });

        // Combine newly expired reservations with already expired ones

        res.status(StatusCodes.OK).json(expiredReservations);
    } catch (error) {
        res.status(500).json("Server Error");
    }
}


async function getMyFinishedReservations(req, res, next) {
    try {
        const userId = req.user.id;

        // Fetch all finished reservations for the logged-in user
        const finishedReservations = await prisma.reservation.findMany({
            where: {
                userId: userId,
                status: "finished",
            },
        });

        res.status(StatusCodes.OK).json(finishedReservations);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Server Error" });
    }
}


async function getMyCanceledReservations(req, res, next) {
    try {
        const userId = req.user.id;

        // Fetch all canceled reservations for the logged-in user
        const canceledReservations = await prisma.reservation.findMany({
            where: {
                userId: userId,
                status: "canceled",
            },
        });

        res.status(StatusCodes.OK).json(canceledReservations);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Server Error" });
    }
}



module.exports = {
    createReservation,
    getMyActiveReservations,
    getMyExpiredReservations,
    getMyFinishedReservations,
    getMyCanceledReservations
    
}
