const Rating = require('../models/Rating');
const Upvote = require('../models/Upvote');
const Template = require('../models/Template');
const checkVerifiedExpert = require('../utils/checkVerifiedExpert');

// ─── EFFECTIVENESS RATING ───────────────────────────────────────────────────────

// @desc    Get aggregated rating data + current user's rating for a template
// @route   GET /api/ratings/:templateId
// @access  Public (optional auth enriches response with user's own rating)
exports.getRatings = async (req, res) => {
    try {
        const { templateId } = req.params;

        // Aggregate rating distribution
        const distribution = await Rating.aggregate([
            { $match: { templateId: require('mongoose').Types.ObjectId.createFromHexString(templateId) } },
            { $group: { _id: '$effectivenessRange', count: { $sum: 1 } } },
        ]);

        const totalRatings = distribution.reduce((sum, d) => sum + d.count, 0);

        // Build distribution map
        const ranges = ['0-10', '10-50', '50-80', '80-100'];
        const ratingDistribution = {};
        ranges.forEach(range => {
            const found = distribution.find(d => d._id === range);
            ratingDistribution[range] = found ? found.count : 0;
        });

        // Calculate weighted average score (midpoint of each range)
        const midpoints = { '0-10': 5, '10-50': 30, '50-80': 65, '80-100': 90 };
        let weightedSum = 0;
        distribution.forEach(d => {
            weightedSum += (midpoints[d._id] || 0) * d.count;
        });
        const averageScore = totalRatings > 0 ? Math.round(weightedSum / totalRatings) : null;

        // Get current user's rating if authenticated
        let userRating = null;
        if (req.user) {
            const existing = await Rating.findOne({ templateId, userId: req.user._id });
            if (existing) {
                userRating = existing.effectivenessRange;
            }
        }

        res.json({
            totalRatings,
            averageScore,
            distribution: ratingDistribution,
            userRating,
        });
    } catch (error) {
        console.error('Get Ratings Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit or update an effectiveness rating
// @route   POST /api/ratings/:templateId
// @access  Private
exports.submitRating = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { effectivenessRange } = req.body;

        const validRanges = ['0-10', '10-50', '50-80', '80-100'];
        if (!effectivenessRange || !validRanges.includes(effectivenessRange)) {
            return res.status(400).json({
                message: `Invalid effectiveness range. Must be one of: ${validRanges.join(', ')}`,
            });
        }

        // Verify template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Upsert: create or update the user's rating for this template
        const rating = await Rating.findOneAndUpdate(
            { templateId, userId: req.user._id },
            { effectivenessRange, updatedAt: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Check if the template owner qualifies for Verified Expert
        if (template.user) {
            checkVerifiedExpert(template.user.toString()).catch(err =>
                console.error('Verified Expert check failed:', err)
            );
        }

        res.json({
            message: 'Rating submitted successfully',
            rating: rating.effectivenessRange,
        });
    } catch (error) {
        console.error('Submit Rating Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── UPVOTE SYSTEM ──────────────────────────────────────────────────────────────

// @desc    Get upvote count + whether current user has upvoted
// @route   GET /api/ratings/:templateId/upvote
// @access  Public (optional auth enriches response)
exports.getUpvoteStatus = async (req, res) => {
    try {
        const { templateId } = req.params;

        const count = await Upvote.countDocuments({ templateId });

        let hasUpvoted = false;
        if (req.user) {
            const existing = await Upvote.findOne({ templateId, userId: req.user._id });
            hasUpvoted = !!existing;
        }

        res.json({ count, hasUpvoted });
    } catch (error) {
        console.error('Get Upvote Status Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle upvote (add or remove)
// @route   POST /api/ratings/:templateId/upvote
// @access  Private
exports.toggleUpvote = async (req, res) => {
    try {
        const { templateId } = req.params;

        // Verify template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Check if user already upvoted
        const existing = await Upvote.findOne({ templateId, userId: req.user._id });

        if (existing) {
            // Remove upvote
            await existing.deleteOne();
            const count = await Upvote.countDocuments({ templateId });
            return res.json({ message: 'Upvote removed', hasUpvoted: false, count });
        } else {
            // Add upvote
            await Upvote.create({ templateId, userId: req.user._id });
            const count = await Upvote.countDocuments({ templateId });
            return res.json({ message: 'Upvoted successfully', hasUpvoted: true, count });
        }
    } catch (error) {
        console.error('Toggle Upvote Error:', error);
        res.status(500).json({ message: error.message });
    }
};
