const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    judul: { type: String, required: true },
    formulirs: [
      {
        judulFormulir: { type: String, required: true },
        isi: { type: String, required: true }, // Bisa menyimpan kombinasi teks dan base64 image
      },
    ],
    status: { type: String, default: "Unsent" },
    isTrue: { type: Boolean, default: false },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    isAcceptedByDosen: { type: Boolean, default: false },
    isSendedToAdmin: { type: Boolean, default: false },
    isSentToDosen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Proposal = mongoose.model("Proposal", proposalSchema);
module.exports = Proposal;
