const Proposal = require("../models/Proposal");
const SubmittedProposal = require("../models/SubmittedProposal");
const History = require("../models/History");
const proposalService = require("../services/proposalService");
const transporter = require("../services/emailConfig");


exports.saveProposal = async (req, res) => {
  try {
    const { judul, formulirs } = req.body;
    const user_id = req.user.userId;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is not found in the token" });
    }

    // Log data untuk debugging
    console.log("User ID from token:", user_id);
    console.log("Received Proposal Data:", { judul, formulirs });

    // Create new proposal object
    const proposal = new Proposal({
      user_id,
      judul,
      formulirs: formulirs, // Save formulirs directly
    });

    // Save proposal to the database
    await proposal.save();

    res.status(201).json({ message: "Proposal berhasil disimpan" });
  } catch (error) {
    console.error('Error saving proposal:', error); // Log error for debugging
    res.status(500).json({ message: error.message });
  }
};

exports.adminGetProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminGetUserProposals = async (req, res) => {
  try {
    const { user_id } = req.params;

    const savedProposals = await Proposal.find({ user_id });

    res.status(200).json(savedProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendProposaltoAdmin = async (req, res) => {
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
};

exports.getProposalById = async (req, res) => {
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
};

exports.editProposalById = async (req, res) => {
  try {
    const { judul, formulirs } = req.body;
    const proposalId = req.params.proposalId;
    const user_id = req.user.userId;

    console.log("Proposal ID from request:", proposalId);
    console.log("User ID from token:", user_id);

    const proposal = await Proposal.findOne({ _id: proposalId, user_id });

    if (!proposal) {
      return res
        .status(404)
        .json({ message: "Proposal not found or not authorized" });
    }

    if (judul) {
      proposal.judul = judul;
    }

    if (formulirs) {
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

    res
      .status(200)
      .json({ message: "Proposal updated successfully", proposal });
  } catch (error) {
    console.error("Error during proposal update:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.adminGetSubmittedProposals = async (req, res) => {
  try {
    const submittedProposals = await SubmittedProposal.find()
      .populate({
        path: 'admin_id',
        match: { role: 'admin' }, // Pastikan hanya admin yang diambil
      })
      .populate('proposal_id');

    if (submittedProposals.length === 0) {
      return res.status(404).json({ message: "No submitted proposals found" });
    }

    res.status(200).json(submittedProposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getUserProposals = async (req, res) => {
  try {
    const user_id = req.user.userId;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is not found in the token" });
    }

    const proposals = await Proposal.find({ user_id });

    if (proposals.length === 0) {
      return res.status(404).json({ message: "No proposals found for this user" });
    }

    res.status(200).json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteProposalById = async (req, res) => {
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
};

