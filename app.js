require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reviewProposalRoutes = require('./routes/reviewProposalRoutes');
const historyRoutes = require('./routes/historyRoutes');
const proposalController = require('./controllers/proposalController');


const multer = require('multer');

// Konfigurasi penyimpanan file dengan multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Tentukan direktori penyimpanan file gambar
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Tentukan nama file yang disimpan (misalnya: tanggal saat ini + nama file asli)
    cb(null, Date.now() + '-' + file.originalname)
  }
});

// Buat instance multer dengan konfigurasi penyimpanan
const upload = multer({ storage: storage });

// const authenticateUser = require('./middleware/authenticateUser');

const authenticateUser = (req, res, next) => {
    // Lakukan logika autentikasi di sini, misalnya menggunakan JWT atau Passport.js

    // Jika autentikasi berhasil, atur req.user dengan informasi pengguna yang sesuai
    req.user = {
        // Atur properti user sesuai dengan hasil autentikasi
        role: 'administrator' // Contoh: role diatur sebagai 'administrator' untuk uji coba
    };

    next();
};


// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

app.use(bodyParser.json());

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(authenticateUser);


// Connect to MongoDB
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const userRoutes = require('./routes/userRoutes');
const authController = require('./controllers/authController');



app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/users', userRoutes);
app.post('/api/admin/register-dosen', authController.registerDosen);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/review-proposal', reviewRoutes);
app.use('/api/review-proposal', reviewProposalRoutes);
app.use('/api/history', historyRoutes);
app.post('/api/send-proposal', proposalController.sendProposalHandler);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
