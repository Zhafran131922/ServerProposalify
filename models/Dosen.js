const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dosenSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bidangKeahlian: {
        type: String,
        required: true
    }
});

const Dosen = mongoose.model('Dosen', dosenSchema);

module.exports = Dosen;
