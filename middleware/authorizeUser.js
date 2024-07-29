const User = require('../models/User'); 

const checkUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'user') {
      return res.status(403).json({ message: 'Only users are allowed to create proposals.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = checkUserRole;
