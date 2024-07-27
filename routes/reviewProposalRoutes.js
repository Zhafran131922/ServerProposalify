const express = require('express');
const router = express.Router();
const ReviewProposal = require('../models/ReviewProposal');
const sendNotificationToOwner = require('../services/emailService');
const Dosen = require('../models/Dosen');
const Proposal = require('../models/Proposal');
const Review = require('../models/Review');

router.get('/:proposalId', async (req, res) => {
    try {
      const proposalId = req.params.proposalId;
      const reviewProposal = await ReviewProposal.findOne({ proposal: proposalId }).populate('proposal');
      if (!reviewProposal) {
        return res.status(404).json({ message: 'Review proposal not found' });
      }
      const email = reviewProposal.proposal.user_email; 
      res.status(200).json(reviewProposal);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  router.post('/:proposalId', async (req, res) => {
    try {
        const { komentar, recipientEmail, dosenId } = req.body;
        const proposalId = req.params.proposalId;

        const review = new ReviewProposal({
            proposal: proposalId,
            komentar: komentar,
            dosen: dosenId
        });
        await review.save();

        await sendNotificationToOwner(recipientEmail, proposalId);

        res.status(201).json({ message: 'Review submitted successfullyss' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/reviews/:proposalId', async (req, res) => {
  try {
      const proposalId = req.params.proposalId;
      const reviewProposals = await ReviewProposal.find({ proposal: proposalId })
          .populate('dosen', 'nama email')
          .populate('proposal');

      if (!reviewProposals || reviewProposals.length === 0) {
          return res.status(404).json({ message: 'Review proposals not found' });
      }
      reviewProposals.forEach(review => {
          console.log('Review:', review);
          console.log('Dosen:', review.dosen);
      });

      const response = reviewProposals.map(review => ({
          komentar: review.komentar,
          dosenNama: review.dosen ? review.dosen.nama : 'Unknown',
          dosenEmail: review.dosen ? review.dosen.email : 'Unknown',
      }));

      res.status(200).json(response);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

router.get('/dosen/:dosenId', async (req, res) => {
  try {
      const dosenId = req.params.dosenId;
      // Find all review proposals by the dosenId
      const reviewProposals = await Review.find({ dosen: dosenId });

      if (!reviewProposals || reviewProposals.length === 0) {
          return res.status(404).json({ message: 'No review proposals found for this dosen' });
      }

      // Extract proposal IDs from the review proposals
      const proposalIds = reviewProposals.map(review => review.proposal);

      // Find proposals based on the extracted IDs
      const proposals = await Proposal.find({ _id: { $in: proposalIds } });

      if (!proposals || proposals.length === 0) {
          return res.status(404).json({ message: 'No proposals found for this dosen' });
      }

      res.status(200).json(proposals);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});


module.exports = router;
