const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getComments,
    createComment,
    deleteComment,
} = require('../controllers/commentController');

// Get comments for a template (public)
router.get('/:templateId', getComments);

// Create a comment (authenticated)
router.post('/:templateId', protect, createComment);

// Delete a comment (authenticated - owner/admin)
router.delete('/:id', protect, deleteComment);

module.exports = router;
