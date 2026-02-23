const mongoose = require('mongoose');

const upvoteSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Enforce one upvote per user per template
upvoteSchema.index({ templateId: 1, userId: 1 }, { unique: true });
// Index for fast count queries
upvoteSchema.index({ templateId: 1 });

const Upvote = mongoose.model('Upvote', upvoteSchema);

module.exports = Upvote;
