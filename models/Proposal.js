const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  judul: { type: String, required: true },
  formulirs: [{ judulFormulir: String, isi: String }],
  status: { type: String, default: "Unsent" }, // Default to 'Draft'
  isTrue: { type: Boolean, default: false },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  isAcceptedByDosen: { type: Boolean, default: false },  // New field to track acceptance by dosen
  isSendedToAdmin: { type: Boolean, default: false },    // New field to track if sent to admin
  isSentToDosen: { type: Boolean, default: false },      // New field to track if sent to dosen
}, { timestamps: true }); // This will add `createdAt` and `updatedAt` fields automatically

const Proposal = mongoose.model("Proposal", proposalSchema);
module.exports = Proposal;
