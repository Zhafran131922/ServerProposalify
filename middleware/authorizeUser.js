const User = require('../models/Role'); 


//Middleware user save,edit, delete, submit proposal
const authorizeUser = async (req, res, next) => {
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


module.exports = authorizeUser;
