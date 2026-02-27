const mongoose = require('mongoose');

const savedTemplateSchema = new mongoose.Schema({
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
    savedAt: {
        type: Date,
        default: Date.now,
    },
});

// One save per user per template
savedTemplateSchema.index({ userId: 1, templateId: 1 }, { unique: true });
// Fast lookup of all saves for a user, sorted by most recent
savedTemplateSchema.index({ userId: 1, savedAt: -1 });

const SavedTemplate = mongoose.model('SavedTemplate', savedTemplateSchema);

module.exports = SavedTemplate;
