const authService = require("../services/authService");
const User = require("../models/Role");
const Dosen = require("../models/Dosen");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerDosen = async (req, res) => { // Tidak Digunakan
  try {
    const { nama, email, password, bidangKeahlian } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const dosen = new Dosen({
      nama,
      email,
      password: hashedPassword,
      bidangKeahlian,
    });

    await dosen.save();

    res.status(201).json({ message: "Akun dosen berhasil ditambahkanss" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerUser = async (req, res) => {
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
};

exports.registerAdmin = async (req, res) => {
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
};

exports.loginAdmin = async (req, res) => {
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
};

exports.loginUser = async (req, res) => {
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
};

exports.loginDosen = async (req, res) => {
  try {
    const { email, password } = req.body;

    const dosen = await Dosen.findOne({ email });
    if (!dosen) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    const isPasswordValid = await bcrypt.compare(password, dosen.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    const token = jwt.sign({ dosenId: dosen._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login berhasil", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//BARU 

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    let role;
    let bidangKeahlian;

    user = await User.findOne({ email });
    if (user) {
      role = user.role;
    } else {
      user = await Dosen.findOne({ email });
      if (user) {
        role = "dosen";
        bidangKeahlian = user.bidangKeahlian; 
      } else {
        return res.status(401).json({ message: "Email atau kata sandi salah" });
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau kata sandi salah" });
    }

    const token = jwt.sign({ userId: user._id, role: role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const response = {
      message: "Login berhasil",
      role,
      token,
    };

    if (role === "dosen") {
      response.bidangKeahlian = bidangKeahlian;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (role !== "user" && role !== "admin") {
      return res.status(400).json({ message: "Role tidak valid" });
    }

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
};

// exports.register = async (req, res) => {
//     try {
//         const user = await authService.register(req.body);
//         res.status(201).json({ user });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const token = await authService.login(email, password);
//         res.status(200).json({ token });
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };
// exports.sendProposalToDosen = async (req, res) => {
//     try {

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.getRegisteredDosens = async (req, res) => {
//     try {
//         const dosens = await Dosen.find();

//         res.status(200).json(dosens);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
