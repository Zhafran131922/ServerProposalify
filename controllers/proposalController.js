const Proposal = require('../models/Proposal');
const proposalService = require('../services/proposalService');
const transporter = require('../services/emailConfig');

exports.submitProposal = async (req, res) => {
    try {
        const proposal = await proposalService.submitProposal(req.body);
        res.status(201).json({ proposal });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getProposals = async (req, res) => {
    try {
        const proposals = await proposalService.getProposals();
        res.status(200).json({ proposals });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.sendProposalHandler = async (req, res) => {
    try {
        const { id, title, background, deskripsiUsaha, penutup, lampiran, dosen_email } = req.body;

        const existingProposal = await Proposal.findById(id);
        if (!existingProposal) {
            return res.status(404).json({ message: 'Proposal not found' });
        }

        existingProposal.title = title;
        existingProposal.background = background;
        existingProposal.deskripsiUsaha = deskripsiUsaha;
        existingProposal.penutup = penutup;
        existingProposal.lampiran = lampiran;

        await existingProposal.save();

        const subject = 'Notification: Proposal Revised';
        const text = 'Dear Professor, The proposal you received has been revised. Please review it.';
        await sendEmail(dosen_email, subject, text);

        res.status(200).json({ message: 'Proposal revised and sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


async function sendEmail(to, subject, text) {
    try {
        const mailOptions = {
            from: 'your_email@gmail.com',
            to: to,
            subject: subject,
            text: text
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

//perlu dihapus
exports.sendProposal = async (req, res) => {
    try {
      const { title, description, attachment, dosen_email } = req.body;
  
      const proposal = new Proposal({ title, description, attachment, dosen_email });
      await proposal.save();
  
      const transporter = nodemailer.createTransport({
      });
  
      const mailOptions = {
        from: 'your_email@example.com',
        to: dosen_email,
        subject: 'New Proposal Received',
        text: `You have received a new proposal. Title: ${title}`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(201).json({ message: 'Proposal sent sxxxuccessfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };