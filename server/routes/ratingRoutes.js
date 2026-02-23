const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
    getRatings,
    submitRating,
    getUpvoteStatus,
    toggleUpvote,
} = require('../controllers/ratingController');

// Effectiveness rating
router.get('/:templateId', optionalAuth, getRatings);
router.post('/:templateId', protect, submitRating);

// Upvote system
router.get('/:templateId/upvote', optionalAuth, getUpvoteStatus);
router.post('/:templateId/upvote', protect, toggleUpvote);

module.exports = router;
