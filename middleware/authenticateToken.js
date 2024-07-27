const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path as needed

// const authenticateToken = (req, res, next) => {
//   const token = req.header('Authorization')?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: 'Access denied, no token provided.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('Decoded Token:', decoded); // Log the decoded token to verify its structure
//     req.user = decoded; // Ensure the decoded token is correctly assigned to req.user
//     next();
//   } catch (ex) {
//     console.log('Token verification failed:', ex); // Log the error for debugging
//     res.status(400).json({ message: 'Invalid token.' });
//   }
// };

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded); // Log the decoded token to verify its structure
    req.user = decoded; // Ensure the decoded token is correctly assigned to req.user
    next();
  } catch (ex) {
    console.log('Token verification failed:', ex); // Log the error for debugging
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
