const Industry = require('../models/Industry');

// Helper to slugify text
const generateSlug = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

// @desc    Get all industries
// @route   GET /api/industries
// @access  Public (or Protected)
const getIndustries = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {}; // Start with finding ALL (including inactive)

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            if (status === 'active') query.isActive = true;
            if (status === 'inactive') query.isActive = false;
        }

        const industries = await Industry.find(query).sort({ createdAt: -1 });

        res.status(200).json(industries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single industry
// @route   GET /api/industries/:id
// @access  Public
const getIndustryById = async (req, res) => {
    try {
        const industry = await Industry.findById(req.params.id);
        if (!industry) {
            return res.status(404).json({ message: 'Industry not found' });
        }
        res.status(200).json(industry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new industry
// @route   POST /api/industries
// @access  Private/Admin
const createIndustry = async (req, res) => {
    try {
        const { name, description, slug, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Please provide a name' });
        }

        let industrySlug = slug ? generateSlug(slug) : generateSlug(name);

        const slugExists = await Industry.findOne({ slug: industrySlug });
        if (slugExists) {
            return res.status(400).json({ message: 'Slug already exists. Please choose another name or slug.' });
        }

        const nameExists = await Industry.findOne({ name });
        if (nameExists) {
            return res.status(400).json({ message: 'Industry with this name already exists' });
        }

        const industry = await Industry.create({
            name,
            slug: industrySlug,
            description,
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json(industry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update industry
// @route   PUT /api/industries/:id
// @access  Private/Admin
const updateIndustry = async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;
        const industry = await Industry.findById(req.params.id);

        if (!industry) {
            return res.status(404).json({ message: 'Industry not found' });
        }

        if (name) industry.name = name;
        if (description !== undefined) industry.description = description;
        if (isActive !== undefined) industry.isActive = isActive;

        if (slug) {
            const newSlug = generateSlug(slug);
            if (newSlug !== industry.slug) {
                const slugExists = await Industry.findOne({ slug: newSlug });
                if (slugExists && slugExists._id.toString() !== req.params.id) {
                    return res.status(400).json({ message: 'Slug already exists' });
                }
                industry.slug = newSlug;
            }
        }

        const updatedIndustry = await industry.save();
        res.status(200).json(updatedIndustry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Hard Delete industry (Only if Inactive)
// @route   DELETE /api/industries/:id
// @access  Private/Admin
const deleteIndustry = async (req, res) => {
    try {
        const industry = await Industry.findById(req.params.id);

        if (!industry) {
            return res.status(404).json({ message: 'Industry not found' });
        }

        // Check if industry is active
        if (industry.isActive) {
            return res.status(400).json({
                message: 'Cannot delete an active industry. Please deactivate it first.'
            });
        }

        // Hard delete
        await industry.deleteOne();

        res.status(200).json({ message: 'Industry permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getIndustries,
    getIndustryById,
    createIndustry,
    updateIndustry,
    deleteIndustry,
};
