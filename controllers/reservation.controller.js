const { StatusCodes } = require("http-status-codes");
const prisma = require("../models/prisma.client");




async function Reserve(req, res, next) {
    try {
      const parkings = await prisma.parking.findMany();
      res.status(StatusCodes.OK).json(parkings);
    } catch (error) {
      next(error);
    }
}

module.exports = {
    Reserve
}