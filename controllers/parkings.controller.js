const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prisma.client");

const { getDistance } = require("geolib");
const { addDays } = require("date-fns");



async function getAllParkings(req, res, next) {
  try {

      // Fetch all parkings including their associated addresses
      const parkings = await prisma.parking.findMany({
          include: {
              address: true, // Include the address details
          },
      });

      res.status(StatusCodes.OK).json(parkings);
  } catch (error) {
      next(error);
  }
}


async function getNearestParkings(req, res, next) {
  try {
      const { longitude, latitude } = req.query;

      if (!longitude || !latitude) {
          return res.status(StatusCodes.BAD_REQUEST).json({ error: "Longitude and latitude are required" });
      }

      // Fetch all parkings with their addresses
      const parkings = await prisma.parking.findMany({
          include: {
              address: true, // Include the address details
          },
      });

      // Calculate distances in kilometers and sort parkings by distance
      const parkingsWithDistance = parkings.map(parking => {
          const distanceInMeters = getDistance(
              { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
              { latitude: parking.address.latitude, longitude: parking.address.longitude }
          );
          const distanceInKilometers = distanceInMeters / 1000; // Convert meters to kilometers
          return { ...parking, distance: distanceInKilometers };
      });

      parkingsWithDistance.sort((a, b) => a.distance - b.distance);

      // Get the 10 nearest parkings
      const nearestParkings = parkingsWithDistance.slice(0, 10);

      res.status(StatusCodes.OK).json(nearestParkings);
  } catch (error) {
      next(error);
  }
}

async function getMostPopularParkings(req, res, next) {
  try {
      // Calculate the date and time 24 hours ago
      const yesterday = addDays(new Date(), -1);

      // Fetch reservations made in the last 24 hours
      const recentReservations = await prisma.reservation.findMany({
          where: {
              dateAndTimeReservation: {
                  gte: yesterday,
              },
          },
          select: {
              parkingId: true,
          },
      });

      // Count the number of reservations for each parking
      const parkingReservationCounts = recentReservations.reduce((counts, reservation) => {
          const parkingId = reservation.parkingId;
          counts[parkingId] = (counts[parkingId] || 0) + 1;
          return counts;
      }, {});

      // Sort parkings based on the reservation count
      const sortedParkings = Object.entries(parkingReservationCounts)
          .map(([parkingId, count]) => ({ parkingId: parseInt(parkingId), count }))
          .sort((a, b) => b.count - a.count);

      // Fetch parking details for the most popular parkings
      const mostPopularParkings = await Promise.all(sortedParkings.slice(0, 10).map(async (entry) => {
          const parking = await prisma.parking.findUnique({
              where: {
                  id: entry.parkingId,
              },
              include: {
                address: true, // Include the address details
            },
          });
          return { ...parking, reservationCount: entry.count };
      }));

      res.status(StatusCodes.OK).json(mostPopularParkings);
  } catch (error) {
      next(error);
  }
}

async function getMostWantedParkings(req, res, next) {
  try {
      // Query all reservations and count the number of reservations for each parking spot
      const parkingReservations = await prisma.reservation.groupBy({
          by: ['parkingId'],
          _count: {
              id: true
          },
          orderBy: {
              _count: {
                  id: 'desc'
              }
          },
          take: 10
      });

      // Extract parking IDs from the result
      const parkingIds = parkingReservations.map(parking => parking.parkingId);

      // Fetch parking details for the most wanted parkings
      const mostWantedParkings = await prisma.parking.findMany({
          where: {
              id: {
                  in: parkingIds
              }
           },
           include: {
            address: true, // Include the address details
          },
      });

      res.status(StatusCodes.OK).json(mostWantedParkings);
  } catch (error) {
      next(error);
  }
}


async function getParkingById(req, res, next) {
  try {
      const { id } = req.params;
      const { longitude, latitude } = req.query;

      // Fetch parking details by ID, including the address
      const parking = await prisma.parking.findUnique({
          where: {
              id: parseInt(id, 10),
          },
          include: {
              address: true,
          },
      });

      if (!parking) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: "Parking not found" });
      }

      // If longitude and latitude are provided, calculate distance
      let distance = null;
      if (longitude && latitude && parking.address.longitude && parking.address.latitude) {
        const distanceInMeters = getDistance(
            { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
            { latitude: parking.address.latitude, longitude: parking.address.longitude },
            1, // Accuracy: 1 for kilometers
        );
        distance = distanceInMeters / 1000; // Convert meters to kilometers
    }

      res.status(StatusCodes.OK).json({ parking, distance });
  } catch (error) {
      next(error);
  }
}


module.exports = {
  getAllParkings,
  getNearestParkings,
  getMostPopularParkings,
  getMostWantedParkings,
  getParkingById

}