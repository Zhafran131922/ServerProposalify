const express = require("express");
const authAdmin = require("../middleware/authAdmin");
const router = express.Router();
const adminController = require("../controllers/adminController");
const ReviewController = require("../controllers/reviewController");


router.get("/dosens", authAdmin, adminController.getAllDosens);
router.delete("/dosens/:id", authAdmin, adminController.deleteDosen);
router.post("/review-proposal", authAdmin, ReviewController.sendProposaltoDosen); //send proposal to dosen
router.get("/proposals/:username",authAdmin, adminController.getProposalsForDosen);
router.get("/get/user-proposals-date", authAdmin, adminController.getRecentSubmittedProposals);


module.exports = router;

