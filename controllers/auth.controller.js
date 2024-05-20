const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const prisma = require("../models/prisma.client");
const bcrypt = require("bcrypt");
const { JWT_EXP, JWT_SECRET } = require("../configs/index");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (notHashedPassword, hashedPassword) => {
  return await bcrypt.compare(notHashedPassword, hashedPassword);
};

const login = async (req, res, next) => {
  try {
    const userCred = req.body;
    if (!userCred.email || !userCred.password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: userCred.email },
    });

    if (!user || !(await comparePassword(userCred.password, user.password))) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      {
        userID: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXP,
      }
    );


    res.status(StatusCodes.OK).json({
      user: {
        email: user.email,
        id: user.id,
      },
      token: token,
    });
  } catch (error) {
    next(error);
  }
};



const register = async (req, res, next) => {
  try {
    const userCred = req.body;
    const hashedPassword = await hashPassword(userCred.password);
    userCred.password = hashedPassword;

    const user = await prisma.user.create({
      data: {
        fullName: userCred.fullName,
        phone: userCred.phone,
        email: userCred.email,
        address : userCred.address,
        password: userCred.password,
      },
    });

    const token = jwt.sign(
      {
        userID: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXP,
      }
    );

    res.status(StatusCodes.OK).json({
      user: {
        email: user.email,
        id: user.id,
      },
      token: token,
    });
  } catch (error) {
    next(error);
  }
};





module.exports = {
  login,
  register,
  hashPassword,
  comparePassword
};