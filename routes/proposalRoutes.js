const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposalController");
const authenticateToken = require("../middleware/authUser");
const authorizeUser = require("../middleware/authorizeUser");
const authAdmin = require("../middleware/authAdmin");
const multer = require('multer');

router.post('/proposals', authenticateToken, authorizeUser, proposalController.saveProposal);
router.get("/proposals/:id", authAdmin, proposalController.adminGetProposal);
router.get("/saved-proposals/:user_id", authAdmin, proposalController.adminGetUserProposals);
router.post("/send-proposal-to-admin", authenticateToken, authorizeUser, proposalController.sendProposaltoAdmin);
router.get("/admin/submitted-proposals", authAdmin, proposalController.adminGetSubmittedProposals);
router.get("/user/proposals", authenticateToken, authorizeUser, proposalController.getUserProposals); 
router.get("/:proposalId", proposalController.getProposalById);
router.put("/:proposalId", authenticateToken, authorizeUser, proposalController.editProposalById);
router.delete("/:proposalId", authenticateToken, authorizeUser, proposalController.deleteProposalById);
router.get("/reviews/:proposalId",authenticateToken, authorizeUser,  proposalController.getReviewsForProposal);
router.get("/reviewed-proposal/by-user", authenticateToken, authorizeUser, proposalController.getUserProposalsWithReviews);
router.get('/proposal/:proposalId/status',authenticateToken, authorizeUser, proposalController.getProposalByIdWithStatus);


module.exports = router;