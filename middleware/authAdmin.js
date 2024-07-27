const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Sesuaikan dengan path yang benar ke model User

const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId); // Pastikan `userId` cocok

    // Cek apakah pengguna ada dan memiliki role admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

module.exports = authMiddleware;
