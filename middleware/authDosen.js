const jwt = require('jsonwebtoken');
const Dosen = require('../models/Dosen'); // Sesuaikan path

const authDosen = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Sesuaikan dengan kunci rahasia yang digunakan
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
