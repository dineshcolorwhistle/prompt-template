const mongoose = require('mongoose');

const expertRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    // Legacy field – kept for backward compatibility
    details: {
        type: String,
    },
    // --- Enhanced structured fields ---
    primaryIndustry: {
        type: String,
        required: [true, 'Primary industry is required'],
        trim: true,
    },
    yearsOfExperience: {
        type: Number,
        required: [true, 'Years of experience is required'],
        min: [0, 'Years of experience cannot be negative'],
    },
    portfolioLink: {
        type: String,
        required: [true, 'Portfolio link is required'],
        trim: true,
    },
    samplePrompt: {
        type: String,
        required: [true, 'Sample prompt is required'],
    },
    methodologyExplanation: {
        type: String,
        required: [true, 'Methodology explanation is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const ExpertRequest = mongoose.model('ExpertRequest', expertRequestSchema);

module.exports = ExpertRequest;
