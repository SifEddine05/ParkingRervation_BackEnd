const express = require("express");
const { register, login, getCurrentUser, loginWithGoogle } = require("../controllers/auth.controller");
const { registerRules, authValidator, loginRules } = require("../middlewares/validators/auth.validator");
const authenticateToken = require("../middlewares/token.middleware");
const authRouter = express.Router();

authRouter.route("/register").post(registerRules ,authValidator, register)
authRouter.route("/loginwithgoogle").post(loginWithGoogle)
authRouter.route("/login").post(loginRules,authValidator,login)
authRouter.route("/me").get(authenticateToken,getCurrentUser)


module.exports = authRouter;