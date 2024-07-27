const User = require('../models/User');
exports.createUser = async ({ username, email, password, role }) => {
    const user = new User({ username, email, password, role });
    return await user.save();
};
exports.getUsers = async () => {
    return await User.find();
};

exports.getUserById = async (userId) => {
    return await User.findById(userId);
};

exports.updateUser = async (userId, userData) => {
    return await User.findByIdAndUpdate(userId, userData, { new: true });
};


exports.deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};
