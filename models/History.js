const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal',
    required: true
  },
  submitDate: {
    type: Date,
    default: Date.now,
    required: true
  }
});

const History = mongoose.model('History', historySchema);

module.exports = History;
