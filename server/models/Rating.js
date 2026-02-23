const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    effectivenessRange: {
        type: String,
        enum: ['0-10', '10-50', '50-80', '80-100'],
        required: [true, 'Effectiveness range is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Enforce one rating per user per template
ratingSchema.index({ templateId: 1, userId: 1 }, { unique: true });
// Index for aggregate queries (ranking, sorting)
ratingSchema.index({ templateId: 1, effectivenessRange: 1 });

ratingSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
