const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const prisma = require("../../models/prisma.client");

const isFutureDate = (value) => {
    const inputDate = new Date(value);
    const currentDate = new Date();
    return inputDate > currentDate;
};

const reservationRules = [
    body("parkingId").notEmpty().withMessage("Parking ID is required").isInt().withMessage("Parking ID must be an integer"),
    body("nbrHours").notEmpty().withMessage("Number of hours is required").isNumeric().withMessage("Number of hours must be numeric"),
    body("dateAndTimeDebut").notEmpty().withMessage("Date and time of start is required").isISO8601().withMessage("Date and time of start must be in ISO8601 format (YYYY-MM-DDTHH:MM:SSZ)").custom(isFutureDate).withMessage("Date and time of start must be in the future"),
];
  

  const reservationValidator = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array()[0].msg);
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: errors.array()[0].msg });
    }
    next();
  };
  
  module.exports = {
    
    reservationRules,
    reservationValidator,
  };