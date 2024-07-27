const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'proposalify01@gmail.com',
        pass: 'byav kijl qnck gkbf'
    }
});

module.exports = transporter;
