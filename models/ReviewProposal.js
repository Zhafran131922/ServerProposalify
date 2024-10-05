const mongoose = require('mongoose');

const reviewProposalSchema = new mongoose.Schema({
  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true,
  },
  komentar: {
    type: String,
    required: true,
  },
  dosen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dosen',
    required: true,
  }
}, { timestamps: true }); // Enable timestamps to automatically handle createdAt and updatedAt

const ReviewProposal = mongoose.model('ReviewProposal', reviewProposalSchema);

module.exports = ReviewProposal;