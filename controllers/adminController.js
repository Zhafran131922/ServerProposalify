const Proposal = require("../models/Proposal");
const Dosen = require("../models/Dosen");
const SubmittedProposal = require("../models/SubmittedProposal");

exports.getProposalsForDosen = async (req, res) => {
  try {
    const { username } = req.params;

    const dosen = await Dosen.findOne({ username });
    if (!dosen) {
      return res.status(404).json({ message: "Dosen not found" });
    }

    const submittedProposals = dosen.submittedProposals;

    res.status(200).json({ submittedProposals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllDosens = async (req, res) => {
  try {
    const dosens = await Dosen.find();
    res.status(200).json({ dosens });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDosen = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDosen = await Dosen.findByIdAndDelete(id);

    if (!deletedDosen) {
      return res.status(404).json({ message: "Akun dosen tidak ditemukan" });
    }

    res
      .status(200)
      .json({ message: "Akun dosen berhasil dihapus", deletedDosen });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentSubmittedProposals = async (req, res) => {
  try {
    const submittedProposals = await SubmittedProposal.find()
      .sort({ createdAt: -1 }) // Sort by the most recent submissions
      .populate({
        path: 'proposal_id',
        populate: {
          path: 'user_id', 
          model: 'User',
          select: 'username email' 
        }
      });

    if (submittedProposals.length === 0) {
      return res.status(404).json({ message: "No recent submitted proposals found" });
    }

    // Map the submitted proposals to include the required fields in the response
    const response = submittedProposals.map(submission => ({
      proposalId: submission.proposal_id._id, 
      username: submission.proposal_id.user_id.username,
      email: submission.proposal_id.user_id.email,
      proposalTitle: submission.proposal_id.judul,
      submittedAt: submission.createdAt
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// exports.sendProposalToDosen = async (req, res) => {
//     try {
//         const { proposal_id, dosen_email } = req.body;

//         const proposal = await Proposal.findById(proposal_id);
//         if (!proposal) {
//             return res.status(404).json({ message: 'Proposal not found' });
//         }

//         const dosen = await Dosen.findOne({ email: dosen_email });
//         if (!dosen) {
//             return res.status(404).json({ message: 'Dosen not found' });
//         }

//         const submittedProposal = new SubmittedProposal({ proposal });
//         dosen.submittedProposals.push(submittedProposal);
//         await dosen.save();

//         res.status(200).json({ message: 'Proposal sent to dosen successfully' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// exports.getRegisteredDosens = async (req, res) => {
//     try {
//         // Logika untuk mendapatkan semua akun dosen yang telah terdaftar
//         const dosens = await Dosen.find();
//         res.status(200).json(dosens);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
