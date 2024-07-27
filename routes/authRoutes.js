const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Dosen = require("../models/Dosen");
const jwt = require("jsonwebtoken");
const authController = require("../controllers/authController");
const roleMiddleware = require("../middleware/roleMiddleware");
const authAdmin = require("../middleware/authAdmin");

router.post("/register/admin", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();

    res.status(201).json({ message: "Pendaftaran berhasil" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login/admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Akses ditolak: Hanya administrator yang dapat login",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login berhasil", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/register/user", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    await user.save();

    res.status(201).json({ message: "Pendaftaran berhasil" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login/user", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Hanya user yang dapat login" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login berhasil", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login/dosen", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Temukan dosen berdasarkan email
    const dosen = await Dosen.findOne({ email });
    if (!dosen) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, dosen.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    // Buat token
    const token = jwt.sign({ dosenId: dosen._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login berhasil", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/admin/register-dosen", authAdmin, authController.registerDosen);

module.exports = router;
