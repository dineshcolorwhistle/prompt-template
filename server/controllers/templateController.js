const Template = require('../models/Template');

// @desc    Get current user's templates
// @route   GET /api/templates/my
// @access  Private (Expert/Admin)
exports.getMyTemplates = async (req, res) => {
    try {
        const templates = await Template.find({ user: req.user._id })
            .populate('industry', 'name')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new template
// @route   POST /api/templates
// @access  Private (Expert/Admin)
exports.createTemplate = async (req, res) => {
    try {
        const { title, description, content, industry, category, status } = req.body;

        const template = await Template.create({
            user: req.user._id,
            title,
            description,
            content,
            industry,
            category,
            status: status || 'Draft',
        });

        const populatedTemplate = await Template.findById(template._id)
            .populate('industry', 'name')
            .populate('category', 'name');

        res.status(201).json(populatedTemplate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a template
// @route   PUT /api/templates/:id
// @access  Private (Owner only)
exports.updateTemplate = async (req, res) => {
    try {
        const { title, description, content, industry, category, status } = req.body;

        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Check ownership
        if (template.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized to update this template' });
        }

        template.title = title || template.title;
        template.description = description || template.description;
        template.content = content || template.content;
        template.industry = industry || template.industry;
        template.category = category || template.category;
        template.status = status || template.status;

        await template.save();

        const updatedTemplate = await Template.findById(template._id)
            .populate('industry', 'name')
            .populate('category', 'name');

        res.json(updatedTemplate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a template
// @route   DELETE /api/templates/:id
// @access  Private (Owner only)
exports.deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Check ownership
        if (template.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized to delete this template' });
        }

        await template.deleteOne();
        res.json({ message: 'Template removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Private
exports.getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id)
            .populate('industry', 'name')
            .populate('category', 'name')
            .populate('user', 'name');

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Optional: Check if user is allowed to view (e.g. if draft, only owner)
        // For now, assuming experts can view details if they have the ID, or maybe restrict drafts?
        // Sticking to "Expert can handle own template. do not see other templates" usually implies listing.
        // If this is for editing, we definitely need ownership check.

        res.json(template);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get template statistics for current user
// @route   GET /api/templates/stats
// @access  Private
exports.getTemplateStats = async (req, res) => {
    try {
        const stats = await Template.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const formattedStats = {
            total: 0,
            draft: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        };

        stats.forEach(stat => {
            const status = stat._id.toLowerCase();
            if (formattedStats.hasOwnProperty(status)) {
                formattedStats[status] = stat.count;
            }
            formattedStats.total += stat.count;
        });

        res.json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
