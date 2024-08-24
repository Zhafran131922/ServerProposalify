const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
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
    ],
    image: { // Menyimpan gambar sebagai Base64
        type: String
    }
}, {
    timestamps: true
});

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;
