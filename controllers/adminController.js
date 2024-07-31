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
