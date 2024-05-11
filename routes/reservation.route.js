const express = require("express");
const { getAllprkings } = require("../controllers/parkings.controller");
const { Reserve } = require("../controllers/reservation.controller");
const reservationRouter = express.Router();

reservationRouter.route("/").post(Reserve)

module.exports = reservationRouter;