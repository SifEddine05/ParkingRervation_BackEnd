const jwt = require("jsonwebtoken");
const prisma = require("../models/prismaClient");
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
    if (decoded.role === "tasker") {
      user = await prisma.tasker.findUnique({
        where: {
          userId: decoded.userID,
        },
        include: {
          User: true,
          Task: {
            select: {
              _count: true,
            },
          },
        },
      });
      user.role = "tasker";
    } else if (decoded.role === "client") {
      user = await prisma.client.findUnique({
        where: {
          id: decoded.userID,
        },
        include: {
          User: true,
        }
      });
      user.role = "client";
    } else if (decoded.role === "user") {
      user = await prisma.user.findUnique({
        where: {
          id: decoded.userID,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      user.role = "user";
    }
    else if (decoded.role === "admin") {
      user = await prisma.admin.findUnique({
        where: {
          id: decoded.adminID,
        },
        select: {
          id: true,
          email: true,
        },
      });
      user.role = "admin";
    }

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