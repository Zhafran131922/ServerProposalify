const Proposal = require("../models/Proposal");
const SubmittedProposal = require("../models/SubmittedProposal");
const ReviewProposal = require("../models/ReviewProposal");
const Review = require("../models/Review");
const Dosen = require("../models/Dosen");
const sendProposalNotification = require("../services/emailService");
const proposalService = require("../services/proposalService");
const transporter = require("../services/emailConfig");
const moment = require("moment-timezone");

exports.saveProposal = async (req, res) => {
  try {
    const { judul, formulirs } = req.body;
    const user_id = req.user.userId;

    if (!user_id) {
      return res
        .status(400)
        .json({ message: "User ID is not found in the token" });
    }

    console.log("User ID from token:", user_id);

    // Check if formulirs is an array
    let parsedFormulirs;
    if (typeof formulirs === "string") {
      try {
        parsedFormulirs = JSON.parse(formulirs);
      } catch (e) {
        return res.status(400).json({ message: "Invalid formulirs format" });
      }
    } else if (Array.isArray(formulirs)) {
      parsedFormulirs = formulirs;
    } else {
      return res
        .status(400)
        .json({ message: "Formulirs must be an array and cannot be empty" });
    }

    // Validate each formulir
    const processedFormulirs = parsedFormulirs.map((formulir) => {
      if (!formulir.judulFormulir || !formulir.isi) {
        throw new Error("Each formulir must have a judulFormulir and isi");
      }
      return formulir;
    });

    // Create and save proposal
    const proposal = new Proposal({
      user_id,
      judul,
      formulirs: processedFormulirs,
    });

    await proposal.save();

    // Format last saved time (updatedAt) to a readable format (e.g., Asia/Jakarta timezone)
    const lastSavedAt = moment(proposal.updatedAt)
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss");

    res.status(201).json({
      message: "Proposal berhasil disimpan",
      lastSavedAt, // Return last saved time
    });
  } catch (error) {
    console.error("Error during proposal save:", error);
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
    const userId = req.user.userId; // Mendapatkan userId dari token

    // Cari proposal berdasarkan ID dan pastikan user_id cocok dengan userId dari token
    const proposal = await Proposal.findOne({ _id: proposalId, user_id: userId });
    if (!proposal) {
      return res.status(404).json({ message: "Proposal tidak ditemukan atau tidak sesuai dengan user" });
    }

    // Update admin_id dan simpan proposal
    proposal.admin_id = adminId;
    await proposal.save();

    // Simpan submitted proposal
    const submittedProposal = new SubmittedProposal({
      proposal_id: proposal._id,
      admin_id: adminId,
    });
    await submittedProposal.save();

    // Convert createdAt ke WIB
    const createdAtWIB = moment(submittedProposal.createdAt)
      .tz("Asia/Jakarta")
      .format("YYYY-MM-DD HH:mm:ss");

    res.status(200).json({
      message: "Proposal berhasil dikirim ke admin",
      submittedProposal: {
        id: submittedProposal._id,
        createdAt: createdAtWIB,
        proposalTitle: proposal.judul,
        adminId: submittedProposal.admin_id,
      },
    });
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
        path: "admin_id",
        match: { role: "admin" }, // Pastikan hanya admin yang diambil
      })
      .populate({
        path: "proposal_id",
        populate: {
          path: "user_id", 
          select: "username email" 
        }
      });

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
      return res
        .status(400)
        .json({ message: "User ID is not found in the token" });
    }

    // Fetch all proposals for the user
    const proposals = await Proposal.find({ user_id }).lean();

    if (proposals.length === 0) {
      return res.status(404).json({ message: "No proposals found for this user" });
    }

    // Iterate through each proposal to assign status and format lastSavedAt
    const formattedProposals = await Promise.all(proposals.map(async (proposal) => {
      let proposalStatus = "Draft"; // Default status is Draft

      // Check if the proposal has been submitted to the admin (Sended status)
      const submittedProposal = await SubmittedProposal.findOne({ proposal_id: proposal._id });
      if (submittedProposal) {
        proposalStatus = "Sended";
      }

      // Check if the proposal is under review by a dosen (On Progress status)
      const review = await Review.findOne({ proposal: proposal._id });
      if (review) {
        proposalStatus = "On Progress";

        // Check if the dosen has submitted their review to the user (On Review status)
        const reviewProposal = await ReviewProposal.findOne({ proposal: proposal._id });
        if (reviewProposal) {
          proposalStatus = "On Review";  // Update status to On Review if review exists
        }
      }

      // Check if the proposal is accepted by a dosen (Accepted status)
      if (proposal.isAcceptedByDosen) {
        proposalStatus = "Accepted";
      }

      // Format last saved time (updatedAt) to a readable format in Asia/Jakarta timezone and add WIB
      const lastSavedAt = moment(proposal.updatedAt)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD HH:mm:ss") + " WIB"; // Add 'WIB' at the end

      return {
        id: proposal._id,
        title: proposal.judul,
        description: proposal.description,
        status: proposalStatus, // Status after determining based on conditions
        lastSavedAt, // Add lastSavedAt field with 'WIB'
        createdAt: proposal.createdAt,
      };
    }));

    // Return the formatted proposals with updated status and lastSavedAt
    res.status(200).json(formattedProposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
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

exports.getReviewsForProposal = async (req, res) => {
  try {
    const proposalId = req.params.proposalId;
    const userId = req.user.userId;

    // Find the proposal and check if it belongs to the user
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }
    
    if (proposal.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized access to reviews" });
    }

    // Find all reviews for the given proposal
    const reviewProposals = await ReviewProposal.find({ proposal: proposalId })
      .populate('dosen', 'nama email') // Populate dosen details
      .populate('proposal', 'judul'); // Optionally populate proposal details

    if (!reviewProposals || reviewProposals.length === 0) {
      return res.status(404).json({ message: "No reviews found for this proposal" });
    }

    // Format the response to include comments and dosen details
    const response = reviewProposals.map(review => ({
      komentar: review.komentar,
      dosenNama: review.dosen ? review.dosen.nama : 'Unknown',
      dosenEmail: review.dosen ? review.dosen.email : 'Unknown',
    }));

    res.status(200).json(response);   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProposalsWithReviews = async (req, res) => {
  try {
    const user_id = req.user.userId;

    // Pastikan user_id ada dalam token
    if (!user_id) {
      return res.status(400).json({ message: "User ID is not found in the token" });
    }

    // Temukan semua proposal yang dimiliki oleh user_id
    const proposals = await Proposal.find({ user_id });

    if (!proposals || proposals.length === 0) {
      return res.status(404).json({ message: "No proposals found for this user" });
    }

    // Loop melalui setiap proposal untuk mengambil review terkait
    const proposalsWithReviews = await Promise.all(
      proposals.map(async (proposal) => {
        // Temukan semua review yang terkait dengan proposal
        const reviews = await ReviewProposal.find({ proposal: proposal._id })
          .populate('dosen', 'nama email') // Populate dosen's nama dan email
          .populate('proposal', 'judul'); // Populate judul proposal (optional)

        // Jika tidak ada review, tetap sertakan proposal tanpa review
        return {
          proposalId: proposal._id,
          proposalTitle: proposal.judul,
          reviews: reviews.map((review) => ({
            komentar: review.komentar,
            dosenNama: review.dosen ? review.dosen.nama : 'Unknown',
            dosenEmail: review.dosen ? review.dosen.email : 'Unknown',
          })),
        };
      })
    );

    res.status(200).json(proposalsWithReviews);
  } catch (error) {
    console.error("Error fetching user proposals with reviews:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProposalByIdWithStatus = async (req, res) => {
  try {
    const { proposalId } = req.params;

    // Log the userId and proposalId for debugging
    console.log('UserId from token:', req.user.userId);
    console.log('ProposalId from request params:', proposalId);

    // Fetch the proposal by ID and ensure the proposal belongs to the authenticated user
    const proposal = await Proposal.findOne({
      _id: proposalId,
      user_id: req.user.userId, // Use userId from token
    });

    if (!proposal) {
      console.log('No proposal found for this user or proposal does not exist.');
      return res.status(404).json({ message: "Proposal not found or you do not have access to it." });
    }

    // Check if the proposal has been submitted to the admin
    const submittedProposal = await SubmittedProposal.findOne({
      proposal_id: proposalId,
    });

    if (submittedProposal) {
      // If the proposal has been sent to the admin, mark it as 'Sended'
      proposal.status = "Sended";
    }

    // Check if the proposal is currently being reviewed by dosen
    const review = await Review.findOne({
      proposal: proposalId,
    });

    if (review) {
      // If the proposal is being reviewed by a dosen, mark it as 'On Progress'
      proposal.status = "On Progress";

      // Check if the dosen has already submitted their review to the user
      const reviewProposal = await ReviewProposal.findOne({
        proposal: proposalId,
      });

      if (reviewProposal) {
        // If the dosen has submitted the review, mark it as 'On Review'
        proposal.status = "On Review";
      }
    }

    // Check if the proposal has been accepted by dosen
    if (proposal.isAcceptedByDosen) {
      // If the proposal is accepted by dosen, mark it as 'Accepted'
      proposal.status = "Accepted";
    }

    // Return the proposal with updated status
    res.status(200).json({
      proposalId: proposal._id,
      title: proposal.judul,
      status: proposal.status,
      details: proposal,
    });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.submitRevisionToDosen = async (req, res) => {
  try {
    // Ambil userId dari token yang telah di-authenticate
    const userId = req.user.userId;
    const { proposalId, dosenId, dosen_email } = req.body;

    // Temukan proposal berdasarkan ID dan pastikan proposal milik userId
    const proposal = await Proposal.findOne({ _id: proposalId, user_id: userId });
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found for this user" });
    }

    // Buat review baru untuk dosen
    const review = new Review({
      dosen: dosenId,
      proposal: proposalId,
      user: userId,
    });
    await review.save();

    // Perbarui status menjadi 'On Progress' di model Proposal
    proposal.status = "On Progress";
    proposal.isSentToDosen = true; // Tandai proposal telah dikirim ke dosen
    await proposal.save();

    // Simpan submittedProposal tanpa pengecekan isSended
    await SubmittedProposal.create({
      proposal_id: proposalId,
      user_id: userId,
      dosen_id: dosenId,
      isSended: true,
    });

    // Kirim notifikasi ke dosen
    await sendProposalNotification(dosen_email);

    // Kembali dengan respons yang mencakup status
    res.status(201).json({
      message: "Proposal sent to dosen successfully",
      status: "On Progress (revision)",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



