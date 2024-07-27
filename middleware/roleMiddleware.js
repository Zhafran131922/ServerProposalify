// module.exports = (requiredRole) => {
//   return (req, res, next) => {
//     if (req.user.role !== requiredRole) {
//       return res.status(403).json({ message: 'Akses ditolak: Peran pengguna tidak sesuai' });
//     }
//     next();
//   };
// };

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Sesuaikan path sesuai dengan struktur proyek Anda

const roleMiddleware = (role) => {
  return async (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Ambil token setelah 'Bearer '

      if (!token) {
          return res.status(401).json({ message: 'Token tidak ditemukan' });
      }

      try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifikasi token
          const user = await User.findById(decoded.id);

          if (!user) {
              return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
          }

          if (user.role !== role) {
              return res.status(403).json({ message: 'Anda tidak memiliki akses' });
          }

          req.user = user; // Simpan user di req untuk rute berikutnya
          next();
      } catch (error) {
          return res.status(403).json({ message: 'Token tidak valid' });
      }
  };
};

module.exports = roleMiddleware;

