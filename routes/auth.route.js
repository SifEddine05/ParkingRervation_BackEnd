const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const { registerRules, authValidator, loginRules } = require("../middlewares/validators/auth.validator");
const authRouter = express.Router();

authRouter.route("/register").post(registerRules ,authValidator, register)
authRouter.route("/login").post(loginRules,authValidator,login)


module.exports = authRouter;