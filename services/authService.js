const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Dosen = require('../models/Dosen');

exports.register = async ({ username, email, password, role }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });
    return await user.save();
};

exports.login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid password');
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    return token;
};


exports.registerDosen = async (userData) => {
    try {
        const { nama, email, password } = userData;

        const hashedPassword = await bcrypt.hash(password, 10);

        const dosen = new Dosen({ nama, email, password: hashedPassword });

        await dosen.save();
        return dosen;
    } catch (error) {
        throw new Error('Gagal menambahkan akun dosen: ' + error.message);
    }
};
