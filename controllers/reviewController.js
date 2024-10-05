const Review = require("../models/Review");
const ReviewProposal = require("../models/ReviewProposal");
const SubmittedProposal = require("../models/SubmittedProposal");
const Proposal = require("../models/Proposal");
const User = require("../models/Role");
const sendProposalNotification = require("../services/emailService");
const sendNotificationToOwner = require("../services/emailService");
const { getProposalById } = require("./proposalController");
const moment = require('moment-timezone');

exports.sendProposaltoDosen = async (req, res) => {
  try {
    const { proposal_id, dosen_id, dosen_email } = req.body;

    // Temukan proposal berdasarkan ID
    const proposal = await Proposal.findById(proposal_id);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Cek apakah proposal sudah dikirim untuk direview
    const submittedProposal = await SubmittedProposal.findOne({ proposal_id });
    if (submittedProposal && submittedProposal.isSended) {
      return res.status(400).json({ message: "Proposal has already been sent for review" });
    }

    // Buat review baru untuk dosen
    const review = new Review({
      dosen: dosen_id,
      proposal: proposal_id,
    });
    await review.save();

    // Perbarui status menjadi 'On Progress' di model Proposal
    proposal.status = "On Progress";
    proposal.isTrue = true;
    proposal.isSentToDosen = true;  // Tandai proposal telah dikirim ke dosen
    await proposal.save();

    // Log untuk memeriksa apakah status diperbarui
    console.log(`Proposal status after save: ${proposal.status}`);
    console.log(`isSentToDosen after save: ${proposal.isSentToDosen}`);

    // Update atau buat submittedProposal
    if (submittedProposal) {
      submittedProposal.isSended = true;
      await submittedProposal.save();
    } else {
      await SubmittedProposal.create({
        proposal_id,
        admin_id: req.user._id,
        isSended: true,
      });
    }

    // Kirim notifikasi ke dosen
    await sendProposalNotification(dosen_email);

    res.status(201).json({ message: "Proposal sent to dosen successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getProposal = async (req, res) => {
  try {
    const proposalId = req.params.proposalId;
    const reviewProposal = await ReviewProposal.findOne({
      proposal: proposalId,
    }).populate("proposal");
    if (!reviewProposal) {
      return res.status(404).json({ message: "Review proposal not found" });
    }
    const email = reviewProposal.proposal.user_email;
    res.status(200).json(reviewProposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendReview = async (req, res) => {
  try {
    const { komentar, recipientEmail } = req.body;
    const proposalId = req.params.proposalId;
    const dosenId = req.dosen._id;

    // Buat objek review baru
    const review = new ReviewProposal({
      proposal: proposalId,
      komentar: komentar,
      dosen: dosenId,
    });
    await review.save();

    // Kirim notifikasi ke pemilik proposal
    await sendNotificationToOwner(recipientEmail, proposalId);

    // Ambil waktu saat ini di zona waktu WIB
    const currentTimeWIB = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');

    // Kembali dengan respons yang mencakup waktu pengiriman dalam WIB
    res.status(201).json({
      message: "Review submitted successfully",
      createdAt: currentTimeWIB, // Tanggal dan waktu saat ini dalam WIB
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getProposalReviews = async (req, res) => {
  try {
    const proposalId = req.params.proposalId;
    const reviewProposals = await ReviewProposal.find({ proposal: proposalId })
      .populate("dosen", "nama email")
      .populate("proposal");

    if (!reviewProposals || reviewProposals.length === 0) {
      return res.status(404).json({ message: "Review proposals not found" });
    }
    reviewProposals.forEach((review) => {
      console.log("Review:", review);
      console.log("Dosen:", review.dosen);
    });

    const response = reviewProposals.map((review) => ({
      komentar: review.komentar,
      dosenNama: review.dosen ? review.dosen.nama : "Unknown",
      dosenEmail: review.dosen ? review.dosen.email : "Unknown",
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewsForDosen = async (req, res) => {
  try {
    const dosenId = req.params.dosenId;
    const reviewProposals = await Review.find({ dosen: dosenId });

    if (!reviewProposals || reviewProposals.length === 0) {
      return res
        .status(404)
        .json({ message: "No review proposals found for this dosen" });
    }

    const proposalIds = reviewProposals.map((review) => review.proposal);

    const proposals = await Proposal.find({
      _id: { $in: proposalIds },
    }).populate("user_id", "username email"); 

    if (!proposals || proposals.length === 0) {
      return res
        .status(404)
        .json({ message: "No proposals found for this dosen" });
    }

    res.status(200).json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviewedProposalByProposalId = async (req, res) => {
  try {
    const review = await Review.findOne({
      proposal: proposalId,
      dosen: dosenId,
    }).populate("proposal");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const proposal = review.proposal;
    res.status(200).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const dosenId = req.dosen._id; // Assuming dosen ID is available in req.dosen

    // Temukan proposal berdasarkan ID
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Cek apakah proposal sudah diterima atau belum
    if (proposal.isAcceptedByDosen) {
      return res.status(400).json({ message: "Proposal already accepted by dosen" });
    }

    // Update proposal status
    proposal.status = "Accepted";
    proposal.isAcceptedByDosen = true;
    await proposal.save();

    // Kirim notifikasi kepada pengguna
    const user = await User.findById(proposal.user_id);
    if (user) {
      await sendNotificationToOwner(user.email, proposalId, 'Proposal Accepted');
    }

    res.status(200).json({ message: "Proposal accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProposalStatus = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const dosenId = req.dosen._id; // Assuming dosen ID is available in req.dosen

    // Temukan proposal berdasarkan ID
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Temukan review terkait dosen untuk proposal ini
    const review = await Review.findOne({
      proposal: proposalId,
      dosen: dosenId,
    });

    // Tentukan status berdasarkan apakah proposal diterima atau belum
    const status = proposal.isAcceptedByDosen
      ? "Accepted"
      : "Not Accepted";

    res.status(200).json({ status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


