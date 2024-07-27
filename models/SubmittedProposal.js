const mongoose = require('mongoose');

const submittedProposalSchema = new mongoose.Schema({
    proposal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proposal', 
        required: true
    },
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', 
        required: true
    }
});

const SubmittedProposal = mongoose.model('SubmittedProposal', submittedProposalSchema);

module.exports = SubmittedProposal;
