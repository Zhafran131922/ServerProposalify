const express = require("express");
const router = express.Router();
const authDosen = require("../middleware/authDosen");
const reviewController = require("../controllers/reviewController");
const { getReviewedProposalByProposalId } = require("../controllers/reviewController");


router.post("/:proposalId", authDosen, reviewController.sendReview);
router.get("/reviews/:proposalId", authDosen, reviewController.getProposalReviews)
router.get("/dosen/:dosenId", authDosen, reviewController.getReviewsForDosen);
router.get("/:proposalId", reviewController.getProposal);
router.get("/reviewed-proposal/:dosenId/:proposalId", getReviewedProposalByProposalId);

module.exports = router;
