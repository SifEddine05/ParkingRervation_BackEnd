const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const prisma = require("../models/prisma.client");
const { v4: uuidv4 } = require('uuid');
const qr = require('qrcode'); // Import the qrcode library
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule'); // Import the node-schedule library
const { sendNotification } = require("../services/sendNotification");



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
        const qrCodeImageUrl = `uploads/qrcodes/${reservationId}.png`;

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

        // Schedule a job to send a notification 15 minutes before the reservation starts
        const notificationTime = new Date(dateAndTimeDebut);
        notificationTime.setMinutes(notificationTime.getMinutes() - 1);

        schedule.scheduleJob(notificationTime, async () => {
            const message = `Your reservation with ID ${reservation.id} is starting in 15 minutes.`;
            await sendNotification(userId, message,reservation.status);
        });


        res.status(StatusCodes.CREATED).json(reservation);
    } catch (error) {
        res.status(500).json("Server Error");
    }
}




async function updateUserFCMToken(req, res, next) {
    try {
        const  userId  = req.user.id;
        const { fcmToken } = req.body;

        // Update the user's fcmToken
        const updatedUser = await prisma.user.update({
            where: {
                id: parseInt(userId, 10),
            },
            data: {
                fcmToken: fcmToken,
            },
        });

        res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
        console.error("Error updating user FCM token:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to update user FCM token" });
    }
}


async function getMyActiveReservations(req, res, next) {
    try {
        const userId = req.user.id;
        const currentDateTime = new Date();

        // Fetch active reservations for the user including parking information
        let activeReservations = await prisma.reservation.findMany({
            where: {
                userId: userId,
                status: "active",
            },
            include: {
                parking: {
                    include : {address:true}
                }, // Include parking information
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
            include: {
                parking: {
                    include : {address:true}
                }, // Include parking information
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
            include: {
                parking: {
                    include : {address:true}
                }, // Include parking information
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
            include: {
                parking: {
                    include : {address:true}
                }, // Include parking information
            },
        });

        res.status(StatusCodes.OK).json(canceledReservations);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Server Error" });
    }
}


async function getReservationById(req, res, next) {
    try {
        const { reservationId } = req.params;

        // Fetch the reservation by ID
        const reservation = await prisma.reservation.findUnique({
            where: {
                id: parseInt(reservationId, 10),
            },
            include: {
                parking: {
                    include : {address:true}
                }, // Include parking information
            },
        });

        if (!reservation) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "Reservation not found" });
        }

        res.status(StatusCodes.OK).json(reservation);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Server Error" });
    }
}


async function cancelReservation(req, res, next) {
    try {
        const { reservationId } = req.params;
        const userId = req.user.id; // Assuming the user is authenticated and user ID is available

        // Fetch the reservation to check if it belongs to the user and is active
        const reservation = await prisma.reservation.findUnique({
            where: {
                id: parseInt(reservationId, 10),
            },
        });

        if (!reservation) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "Reservation not found" });
        }

        if (reservation.userId !== userId) {
            return res.status(StatusCodes.FORBIDDEN).json({ error: "You are not authorized to cancel this reservation" });
        }

        if (reservation.status !== "active") {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Only active reservations can be canceled" });
        }

        // Update the reservation status to canceled
        const canceledReservation = await prisma.reservation.update({
            where: {
                id: parseInt(reservationId, 10),
            },
            data: {
                status: "canceled",
            },
        });

        res.status(StatusCodes.OK).json(canceledReservation);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Server Error" });
    }
}


module.exports = {
    createReservation,
    getMyActiveReservations,
    getMyExpiredReservations,
    getMyFinishedReservations,
    getMyCanceledReservations,
    getReservationById,
    cancelReservation,
    updateUserFCMToken
    
}
