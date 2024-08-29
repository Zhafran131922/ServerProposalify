const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    judul: {
        type: String,
        required: true
    },
    formulirs: [
        {
            judulFormulir: {
                type: String,
                required: true
            },
            isi: {
                type: String, 
                required: true
            }
        }
    ]
});

const Proposal = mongoose.model('Proposal', proposalSchema);
module.exports = Proposal;
