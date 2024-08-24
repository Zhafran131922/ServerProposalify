const mongoose = require('mongoose');
const User = require('./Role'); // Mengimpor model User
const Proposal = require('./Proposal'); // Mengimpor model Proposal

const submittedProposalSchema = new mongoose.Schema({
    proposal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proposal',
        required: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Menggunakan model User
        required: true
    }
});

const SubmittedProposal = mongoose.model('SubmittedProposal', submittedProposalSchema);

module.exports = SubmittedProposal;
