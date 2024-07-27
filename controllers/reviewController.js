const Review = require('../models/Review');
const Proposal = require('../models/Proposal');
const sendProposalNotification = require('../services/emailService');

exports.reviewProposal = async (req, res) => {
    try {
        const { proposal_id, dosen_id, dosen_email } = req.body; 

        const proposal = await Proposal.findById(proposal_id);
        if (!proposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        const review = new Review({
            dosen: dosen_id,
            proposal: proposal_id
        });
        await review.save();

        await sendProposalNotification(dosen_email); 

        res.status(201).json({ message: 'Proposal sent for review successfullyss' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReviewProposalsByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        const reviewProposals = await Review.find({ username }).populate('proposal');
        res.status(200).json(reviewProposals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
