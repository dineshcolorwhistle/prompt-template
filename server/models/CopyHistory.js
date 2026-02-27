const mongoose = require('mongoose');

const copyHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true,
    },
    copiedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for fast lookup of a user's copy history, sorted by most recent
copyHistorySchema.index({ userId: 1, copiedAt: -1 });
// Index for counting copies per template
copyHistorySchema.index({ templateId: 1 });

const CopyHistory = mongoose.model('CopyHistory', copyHistorySchema);

module.exports = CopyHistory;
