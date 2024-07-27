const express = require("express");
const router = express.Router();
const Proposal = require("../models/Proposal");
const SubmittedProposal = require("../models/SubmittedProposal");
const proposalController = require("../controllers/proposalController");
const Dosen = require("../models/Dosen");
const sendProposalNotification = require("../services/emailService");
const { sendProposalHandler } = require("../controllers/proposalController");
const multer = require("multer");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeUser = require("../middleware/authorizeUser");
const authAdmin = require("../middleware/authAdmin");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/proposals", authenticateToken, authorizeUser, async (req, res) => {
  try {
    const { judul, formulirs } = req.body;
    const user_id = req.user.userId; // Access userId from the decoded token

    if (!user_id) {
      return res.status(400).json({ message: "User ID is not found in the token" });
    }

    console.log('User ID from token:', user_id); // Log user ID to verify it's correct

    // Validate and parse formulirs if necessary
    let parsedFormulirs;
    if (typeof formulirs === "string") {
      try {
        parsedFormulirs = JSON.parse(formulirs);
      } catch (e) {
        return res.status(400).json({ message: "Invalid formulirs format" });
      }
    } else {
      parsedFormulirs = formulirs;
    }

    const proposal = new Proposal({
      user_id,
      judul,
      formulirs: parsedFormulirs,
    });

    await proposal.save();

    res.status(201).json({ message: "Proposal berhasil disimpan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.get("/proposals/:id", authAdmin, async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/saved-proposals/:user_id", authAdmin, async (req, res) => {
    try {
      const { user_id } = req.params;
  
      const savedProposals = await Proposal.find({ user_id });
  
      res.status(200).json(savedProposals);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

router.post("/send-proposal-to-admin", authenticateToken, async (req, res) => {
  try {
    const { proposalId, adminId } = req.body;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal tidak ditemukan" });
    }
    proposal.admin_id = adminId;
    await proposal.save();

    const submittedProposal = new SubmittedProposal({
      proposal_id: proposal._id,
      admin_id: adminId,
    });
    await submittedProposal.save();

    res
      .status(200)
      .json({ message: "Proposal berhasil dikirim ke administratorsss" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/saved-proposals/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const savedProposals = await Proposal.find({ user_id });

    res.status(200).json(savedProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/submitted-proposals/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const submittedProposals = await SubmittedProposal.find({ user_id });

    res.status(200).json(submittedProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:proposalId", async (req, res) => {
  try {
    const proposalId = req.params.proposalId;
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:proposalId", authenticateToken, authorizeUser, async (req, res) => {
  try {
    const { judul, formulirs } = req.body;
    const proposalId = req.params.proposalId;
    const user_id = req.user.userId; // Access userId from the decoded token

    console.log('Proposal ID from request:', proposalId); // Log proposal ID to verify it's correct
    console.log('User ID from token:', user_id); // Log user ID to verify it's correct

    // Find proposal by ID and user ID
    const proposal = await Proposal.findOne({ _id: proposalId, user_id });
    
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found or not authorized" });
    }

    // Update fields
    if (judul) {
      proposal.judul = judul;
    }

    if (formulirs) {
      // If formulirs is a string, parse it to JSON
      if (typeof formulirs === "string") {
        try {
          proposal.formulirs = JSON.parse(formulirs);
        } catch (e) {
          return res.status(400).json({ message: "Invalid formulirs format" });
        }
      } else if (Array.isArray(formulirs)) {
        proposal.formulirs = formulirs;
      } else {
        return res.status(400).json({ message: "Invalid formulirs data" });
      }
    }

    await proposal.save();

    res.status(200).json({ message: "Proposal updated successfully", proposal });
  } catch (error) {
    console.error('Error during proposal update:', error); // Log error details
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:proposalId", authenticateToken, authorizeUser, async (req, res) => {
  try {
    const proposalId = req.params.proposalId;

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    await Proposal.findByIdAndDelete(proposalId);

    res.status(200).json({ message: "Proposal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;