const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposalController");
const authenticateToken = require("../middleware/authUser");
const authorizeUser = require("../middleware/authorizeUser");
const authAdmin = require("../middleware/authAdmin");


router.post("/proposals", authenticateToken, authorizeUser, proposalController.saveProposal);
router.get("/proposals/:id", authAdmin, proposalController.adminGetProposal);
router.get("/saved-proposals/:user_id", authAdmin, proposalController.adminGetUserProposals);
router.post("/send-proposal-to-admin", authenticateToken, authorizeUser, proposalController.sendProposaltoAdmin);
router.get("/admin/submitted-proposals", authAdmin, proposalController.adminGetSubmittedProposals);
router.get("/user/proposals", authenticateToken, authorizeUser, proposalController.getUserProposals); 
router.get("/:proposalId", proposalController.getProposalById);
router.put("/:proposalId", authenticateToken, authorizeUser, proposalController.editProposalById);
router.delete("/:proposalId", authenticateToken, authorizeUser, proposalController.deleteProposalById);


module.exports = router;