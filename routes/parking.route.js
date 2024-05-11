const express = require("express");
const { getAllprkings } = require("../controllers/parkings.controller");
const authenticateToken = require("../middlewares/token.middleware");
const parkingRouter = express.Router();

parkingRouter.route("/all").get(authenticateToken,getAllprkings)

module.exports = parkingRouter;