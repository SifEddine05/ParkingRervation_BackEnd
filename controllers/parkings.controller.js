const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prisma.client");




async function getAllprkings(req, res, next) {
    try {
      console.log(req.user);
      const parkings = await prisma.parking.findMany();
      res.status(StatusCodes.OK).json(parkings);
    } catch (error) {
      next(error);
    }
}

module.exports = {
    getAllprkings
}