const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    dosen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dosen', 
        required: true
    },
    proposal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proposal', 
        required: true
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

