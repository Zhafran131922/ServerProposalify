const transporter = require('./emailConfig');

async function sendReviewNotification(proposalId) {
  const email = 'contoh@example.com'; 
  const mailOptions = {
    from: 'proposalify01@gmail.com',
    to: email,
    subject: 'Notification: Proposal Reviewed',
    text: 'Dear User,\n\nYour proposal has been reviewed.\n\nBest regards,\nProposalify Team'
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Review notification sent to user:', email);
  } catch (error) {
    console.error('Failed to send review notification:', error);
  }
}

module.exports = sendReviewNotification;
