require("dotenv").config();

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
app.use(cors());
app.use(morgan("dev"));
app.use(authenticateUser);

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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
