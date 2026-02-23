const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    role: {
        type: String,
        enum: ['user', 'expert', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient querying of threaded comments
commentSchema.index({ templateId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
