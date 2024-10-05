require("dotenv").config();

const multer = require("multer");

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/adminRoutes");
const reviewProposalRoutes = require("./routes/dosenRoutes");

const authRoutes = require("./routes/authRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
// const userRoutes = require('./routes/userRoutes');
const authController = require("./controllers/authController");

const authenticateUser = (req, res, next) => {
  req.user = {
    role: "administrator", 
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
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: 'GET,POST,PUT,DELETE',  // Specify the allowed methods
  credentials: true // If you need to allow cookies or authorization headers
}));
app.use(morgan("dev"));
app.use(authenticateUser);
app.use(bodyParser.urlencoded({ extended: true })); // Supports form-data
app.use(bodyParser.json()); // Supports JSON
const upload = multer();
// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/review-proposal", reviewProposalRoutes);
app.post("/api/admin/register-dosen", authController.registerDosen);
// app.use("/api/history", historyRoutes);
// app.use('/api/admin/review-proposal', reviewRoutes);
// app.use('/api/users', userRoutes);
// app.post('/api/send-proposal', proposalController.sendProposalHandler);
app.post('/api/proposalss', upload.none(), async (req, res) => {
  try {
    const { judul, formulirs } = req.body;
    const user_id = req.user.userId;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is not found in the token" });
    }

    console.log("User ID from token:", user_id);

    // Parse formulirs if it is a string
    let parsedFormulirs;
    if (typeof formulirs === 'string') {
      try {
        parsedFormulirs = JSON.parse(formulirs);
      } catch (e) {
        return res.status(400).json({ message: "Invalid formulirs format" });
      }
    } else if (Array.isArray(formulirs)) {
      parsedFormulirs = formulirs;
    } else {
      return res.status(400).json({ message: "Formulirs must be an array and cannot be empty" });
    }

    const processedFormulirs = parsedFormulirs.map(formulir => {
      if (!formulir.judulFormulir || !formulir.isi) {
        throw new Error('Each formulir must have a judulFormulir and isi');
      }

      // If isi is base64, process it accordingly
      if (formulir.isi.startsWith('data:image')) {
        return formulir;
      }

      return formulir;
    });

    const proposal = new Proposal({
      user_id,
      judul,
      formulirs: processedFormulirs,
    });

    await proposal.save();

    res.status(201).json({ message: "Proposal berhasil disimpan" });
  } catch (error) {
    console.error("Error during proposal save:", error);
    res.status(500).json({ message: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
