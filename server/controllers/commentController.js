const Comment = require('../models/Comment');
const Template = require('../models/Template');

// @desc    Get comments for a template (threaded)
// @route   GET /api/comments/:templateId
// @access  Public
exports.getComments = async (req, res) => {
    try {
        const { templateId } = req.params;

        // Verify template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const comments = await Comment.find({ templateId })
            .populate('userId', 'name role isVerifiedExpert')
            .sort({ createdAt: -1 });

        // Build threaded structure
        const commentMap = {};
        const rootComments = [];

        comments.forEach(comment => {
            commentMap[comment._id.toString()] = {
                ...comment.toObject(),
                replies: [],
            };
        });

        comments.forEach(comment => {
            if (comment.parentId) {
                const parentId = comment.parentId.toString();
                if (commentMap[parentId]) {
                    commentMap[parentId].replies.push(commentMap[comment._id.toString()]);
                }
            } else {
                rootComments.push(commentMap[comment._id.toString()]);
            }
        });

        // Sort replies by oldest first (chronological)
        const sortReplies = (comments) => {
            comments.forEach(comment => {
                comment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                if (comment.replies.length > 0) {
                    sortReplies(comment.replies);
                }
            });
        };
        sortReplies(rootComments);

        res.json(rootComments);
    } catch (error) {
        console.error('Get Comments Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a comment
// @route   POST /api/comments/:templateId
// @access  Private
exports.createComment = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { content, parentId } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        // Verify template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // If replying, verify parent comment exists
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
            // Ensure parent belongs to same template
            if (parentComment.templateId.toString() !== templateId) {
                return res.status(400).json({ message: 'Parent comment does not belong to this template' });
            }
        }

        // Derive role from user model
        let commentRole = 'user';
        if (req.user.role === 'Admin') {
            commentRole = 'admin';
        } else if (req.user.role === 'Expert' && req.user.isVerifiedExpert) {
            commentRole = 'expert';
        }

        const comment = await Comment.create({
            templateId,
            userId: req.user._id,
            parentId: parentId || null,
            content: content.trim(),
            role: commentRole,
        });

        const populatedComment = await Comment.findById(comment._id)
            .populate('userId', 'name role isVerifiedExpert');

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('Create Comment Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (owner or admin)
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check ownership or admin
        if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized to delete this comment' });
        }

        // Delete all child comments recursively
        const deleteChildren = async (parentId) => {
            const children = await Comment.find({ parentId });
            for (const child of children) {
                await deleteChildren(child._id);
                await child.deleteOne();
            }
        };

        await deleteChildren(comment._id);
        await comment.deleteOne();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete Comment Error:', error);
        res.status(500).json({ message: error.message });
    }
};
