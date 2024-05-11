const jwt = require("jsonwebtoken");
const prisma = require("../models/prisma.client");
const { JWT_SECRET, exclude } = require("../configs");
const { StatusCodes } = require("http-status-codes");

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user;
    user = await prisma.user.findUnique({
      where: {
        id: decoded.userID,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        address : true
      },
    })

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }
    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticateToken;