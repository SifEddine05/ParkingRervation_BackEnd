const { body, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const prisma = require("../../models/prisma.client");


const registerRules = [
    body("fullName").notEmpty().withMessage("full name is required").trim(),
    body("address").notEmpty().withMessage("full name is required").trim(),

    
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .trim()
      .isEmail()
      .withMessage("Email is invalid")
      .normalizeEmail()
      .custom(async (email) => {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          return Promise.reject("Email already in use");
        }
      }),
  
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/^(?=.*[A-Z])[ -~]*$/)
      .withMessage(
        "Password must contain at least one uppercase letter and can contain only printable characters"
      ),
  
    body("phone")
      .notEmpty()
      .withMessage("Phone number is required")
      .trim()
      .isNumeric()
      .withMessage("Phone number must contain only numeric characters")
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone number must be 10 digits long")
      .custom((value) => {
        if (
          !(
            value.startsWith("05") ||
            value.startsWith("06") ||
            value.startsWith("07")
          )
        ) {
          throw new Error("Phone number must start with 05|06|07");
        }
        return true;
      }),
  ];
  
  const loginRules = [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .trim()
      .isEmail()
      .withMessage("Email is invalid"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/^(?=.*[A-Z])[ -~]*$/)
      .withMessage(
        "Password must contain at least one uppercase letter and can contain only printable characters"
      ),
  ];

  const authValidator = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: errors.array()[0].msg });
    }
    next();
  };
  
  module.exports = {
    registerRules,
    loginRules,
    authValidator,
  };