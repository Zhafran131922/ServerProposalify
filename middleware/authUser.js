const jwt = require('jsonwebtoken');
const User = require('../models/Role'); // Adjust the path as needed


const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); 
    req.user = decoded; 
    next();
  } catch (ex) {
    console.log('Token verification failed:', ex); 
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
