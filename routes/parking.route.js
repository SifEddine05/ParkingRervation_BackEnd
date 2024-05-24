const express = require("express");
const { getAllParkings, getNearestParkings, getMostPopularParkings, getMostWantedParkings, getParkingById } = require("../controllers/parkings.controller");
const authenticateToken = require("../middlewares/token.middleware");
const parkingRouter = express.Router();

parkingRouter.route("/all").get(authenticateToken,getAllParkings)
// in get Parking By id i need to get nomber of disponible places 
parkingRouter.route("/nearest").get(authenticateToken,getNearestParkings)
parkingRouter.route("/popular").get(authenticateToken,getMostPopularParkings)
parkingRouter.route("/wanted").get(authenticateToken,getMostWantedParkings)
parkingRouter.route("/:id").get(authenticateToken,getParkingById)



module.exports = parkingRouter;