const jwt = require('jsonwebtoken');
const Dosen = require('../models/Dosen');

const authDosen = async (req, res, next) => {
    try {
      const token = req.header('Authorization').replace('Bearer ', '');
      console.log('Token:', token);  // Logging token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded:', decoded);  // Logging decoded payload
      const dosen = await Dosen.findOne({ _id: decoded.dosenId });
  
      if (!dosen) {
        throw new Error();
      }
  
      req.token = token;
      req.dosen = dosen;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid Token.' });
    }
  };
  

module.exports = authDosen;
