const express = require("express");
const { getAllprkings } = require("../controllers/parkings.controller");
const {  createReservation,  getMyActiveReservations, getMyExpiredReservations, getMyFinishedReservations, getMyCanceledReservations, getReservationById, cancelReservation } = require("../controllers/reservation.controller");
const { reservationRules, reservationValidator } = require("../middlewares/validators/reservation.validator");
const authenticateToken = require("../middlewares/token.middleware");
const reservationRouter = express.Router();

reservationRouter.route("/").post(authenticateToken,reservationRules,reservationValidator,createReservation)
reservationRouter.route("/active").get(authenticateToken,getMyActiveReservations)
reservationRouter.route("/expire").get(authenticateToken,getMyExpiredReservations)
reservationRouter.route("/finish").get(authenticateToken,getMyFinishedReservations)
reservationRouter.route("/cancel").get(authenticateToken,getMyCanceledReservations)
reservationRouter.route("/:reservationId").get(authenticateToken,getReservationById)
reservationRouter.route("/:reservationId").put(authenticateToken,cancelReservation)





module.exports = reservationRouter;