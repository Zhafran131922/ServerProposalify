const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports.authenticateAdmin = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new Error("Header Authorization tidak ditemukan");
    }

    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    if (user.role !== "administrator") {
      throw new Error(
        "Unauthorized: Only administrators can access this resource"
      );
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Autentikasi gagal", error: error.message });
  }
};

module.exports.authenticateUser = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      throw new Error("Header Authorization tidak ditemukan");
    }

    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Autentikasi gagal", error: error.message });
  }
};
