const Proposal = require('../models/Proposal');

exports.submitProposal = async (proposalData) => {
    const proposal = new Proposal(proposalData);
    await proposal.save();
    return proposal;
};

exports.getProposals = async () => {
    const proposals = await Proposal.find();
    return proposals;
};


exports.getEmailDosenById = async (dosenId) => {
    try {
        const dosen = await Dosen.findById(dosenId);
        if (!dosen) {
            throw new Error('Dosen not found');
        }
        return dosen.email;
    } catch (error) {
        throw new Error(`Failed to get email of dosen: ${error.message}`);
    }
};