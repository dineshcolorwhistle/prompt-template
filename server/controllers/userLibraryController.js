const SavedTemplate = require('../models/SavedTemplate');
const CopyHistory = require('../models/CopyHistory');
const Rating = require('../models/Rating');
const Template = require('../models/Template');

// ─── SAVED TEMPLATES ────────────────────────────────────────────────────────────

// @desc    Toggle save/unsave a template (bookmark)
// @route   POST /api/user-library/save/:templateId
// @access  Private
exports.toggleSaveTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;

        // Verify template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        const existing = await SavedTemplate.findOne({
            userId: req.user._id,
            templateId,
        });

        if (existing) {
            await existing.deleteOne();
            return res.json({ message: 'Template unsaved', isSaved: false });
        } else {
            await SavedTemplate.create({ userId: req.user._id, templateId });
            return res.json({ message: 'Template saved', isSaved: true });
        }
    } catch (error) {
        console.error('Toggle Save Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if a template is saved by the current user
// @route   GET /api/user-library/save/:templateId
// @access  Private (optional auth)
exports.getSaveStatus = async (req, res) => {
    try {
        const { templateId } = req.params;

        let isSaved = false;
        if (req.user) {
            const existing = await SavedTemplate.findOne({
                userId: req.user._id,
                templateId,
            });
            isSaved = !!existing;
        }

        res.json({ isSaved });
    } catch (error) {
        console.error('Get Save Status Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all saved templates for the current user
// @route   GET /api/user-library/saved
// @access  Private
exports.getSavedTemplates = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const totalItems = await SavedTemplate.countDocuments({ userId: req.user._id });

        const savedEntries = await SavedTemplate.find({ userId: req.user._id })
            .sort({ savedAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate({
                path: 'templateId',
                populate: [
                    { path: 'industry', populate: { path: 'llm', select: 'name' } },
                    { path: 'category', select: 'name' },
                    { path: 'user', select: 'name' },
                ],
            });

        // Filter out entries where template was deleted
        const templates = savedEntries
            .filter(e => e.templateId)
            .map(e => ({ ...e.templateId.toObject(), savedAt: e.savedAt }));

        // Attach rating info for each template
        const templatesWithRatings = await Promise.all(
            templates.map(async (t) => {
                const ratingAgg = await Rating.aggregate([
                    { $match: { templateId: t._id } },
                    { $group: { _id: '$effectivenessRange', count: { $sum: 1 } } },
                ]);
                const totalRatings = ratingAgg.reduce((sum, d) => sum + d.count, 0);
                const midpoints = { '0-10': 5, '10-50': 30, '50-80': 65, '80-100': 90 };
                let weightedSum = 0;
                ratingAgg.forEach(d => { weightedSum += (midpoints[d._id] || 0) * d.count; });
                const averageScore = totalRatings > 0 ? Math.round(weightedSum / totalRatings) : null;

                return {
                    ...t,
                    ratingInfo: { averageScore, totalRatings },
                };
            })
        );

        res.json({
            result: templatesWithRatings,
            page: pageNum,
            pages: Math.ceil(totalItems / limitNum),
            total: totalItems,
        });
    } catch (error) {
        console.error('Get Saved Templates Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── RATED TEMPLATES ────────────────────────────────────────────────────────────

// @desc    Get all templates rated by the current user
// @route   GET /api/user-library/rated
// @access  Private
exports.getRatedTemplates = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const totalItems = await Rating.countDocuments({ userId: req.user._id });

        const ratingEntries = await Rating.find({ userId: req.user._id })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate({
                path: 'templateId',
                populate: [
                    { path: 'industry', populate: { path: 'llm', select: 'name' } },
                    { path: 'category', select: 'name' },
                    { path: 'user', select: 'name' },
                ],
            });

        const templates = ratingEntries
            .filter(e => e.templateId)
            .map(e => ({
                ...e.templateId.toObject(),
                userRating: e.effectivenessRange,
                ratedAt: e.updatedAt,
            }));

        // Attach aggregated rating info
        const templatesWithRatings = await Promise.all(
            templates.map(async (t) => {
                const ratingAgg = await Rating.aggregate([
                    { $match: { templateId: t._id } },
                    { $group: { _id: '$effectivenessRange', count: { $sum: 1 } } },
                ]);
                const totalRatings = ratingAgg.reduce((sum, d) => sum + d.count, 0);
                const midpoints = { '0-10': 5, '10-50': 30, '50-80': 65, '80-100': 90 };
                let weightedSum = 0;
                ratingAgg.forEach(d => { weightedSum += (midpoints[d._id] || 0) * d.count; });
                const averageScore = totalRatings > 0 ? Math.round(weightedSum / totalRatings) : null;

                return {
                    ...t,
                    ratingInfo: { averageScore, totalRatings },
                };
            })
        );

        res.json({
            result: templatesWithRatings,
            page: pageNum,
            pages: Math.ceil(totalItems / limitNum),
            total: totalItems,
        });
    } catch (error) {
        console.error('Get Rated Templates Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── COPY HISTORY ───────────────────────────────────────────────────────────────

// @desc    Record a template copy event
// @route   POST /api/user-library/copy/:templateId
// @access  Private
exports.recordCopy = async (req, res) => {
    try {
        const { templateId } = req.params;

        // Verify template exists
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        await CopyHistory.create({ userId: req.user._id, templateId });

        res.json({ message: 'Copy recorded' });
    } catch (error) {
        console.error('Record Copy Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recently copied templates for the current user
// @route   GET /api/user-library/copies
// @access  Private
exports.getCopyHistory = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get distinct templates with their latest copy timestamp
        const pipeline = [
            { $match: { userId: req.user._id } },
            { $sort: { copiedAt: -1 } },
            {
                $group: {
                    _id: '$templateId',
                    lastCopiedAt: { $first: '$copiedAt' },
                    copyCount: { $sum: 1 },
                },
            },
            { $sort: { lastCopiedAt: -1 } },
        ];

        const allCopied = await CopyHistory.aggregate(pipeline);
        const totalItems = allCopied.length;

        const paginatedIds = allCopied.slice(skip, skip + limitNum);

        // Populate template data
        const templates = await Promise.all(
            paginatedIds.map(async (entry) => {
                const template = await Template.findById(entry._id)
                    .populate({ path: 'industry', populate: { path: 'llm', select: 'name' } })
                    .populate('category', 'name')
                    .populate('user', 'name');

                if (!template) return null;

                // Get rating info
                const ratingAgg = await Rating.aggregate([
                    { $match: { templateId: template._id } },
                    { $group: { _id: '$effectivenessRange', count: { $sum: 1 } } },
                ]);
                const totalRatings = ratingAgg.reduce((sum, d) => sum + d.count, 0);
                const midpoints = { '0-10': 5, '10-50': 30, '50-80': 65, '80-100': 90 };
                let weightedSum = 0;
                ratingAgg.forEach(d => { weightedSum += (midpoints[d._id] || 0) * d.count; });
                const averageScore = totalRatings > 0 ? Math.round(weightedSum / totalRatings) : null;

                return {
                    ...template.toObject(),
                    lastCopiedAt: entry.lastCopiedAt,
                    copyCount: entry.copyCount,
                    ratingInfo: { averageScore, totalRatings },
                };
            })
        );

        res.json({
            result: templates.filter(Boolean),
            page: pageNum,
            pages: Math.ceil(totalItems / limitNum),
            total: totalItems,
        });
    } catch (error) {
        console.error('Get Copy History Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user library dashboard stats
// @route   GET /api/user-library/stats
// @access  Private
exports.getUserLibraryStats = async (req, res) => {
    try {
        const savedCount = await SavedTemplate.countDocuments({ userId: req.user._id });
        const ratedCount = await Rating.countDocuments({ userId: req.user._id });

        // Count distinct templates copied
        const copyAgg = await CopyHistory.aggregate([
            { $match: { userId: req.user._id } },
            { $group: { _id: '$templateId' } },
            { $count: 'count' },
        ]);
        const copiedCount = copyAgg.length > 0 ? copyAgg[0].count : 0;

        // Total copy events
        const totalCopies = await CopyHistory.countDocuments({ userId: req.user._id });

        res.json({
            savedCount,
            ratedCount,
            copiedCount,
            totalCopies,
        });
    } catch (error) {
        console.error('Get User Library Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};
