const Industry = require('../models/Industry');
const LLM = require('../models/LLM');

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
        const { search, status, llm, page = 1, limit = 10 } = req.query;
        let query = {};

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

        // Filter by LLM
        if (llm && llm !== 'all') {
            query.llm = llm;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const totalItems = await Industry.countDocuments(query);
        const industries = await Industry.find(query)
            .populate('llm', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            result: industries,
            page: pageNum,
            pages: Math.ceil(totalItems / limitNum),
            total: totalItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single industry
// @route   GET /api/industries/:id
// @access  Public
const getIndustryById = async (req, res) => {
    try {
        const industry = await Industry.findById(req.params.id).populate('llm', 'name');
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
        const { name, description, slug, llm, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Please provide a name' });
        }

        if (!llm) {
            return res.status(400).json({ message: 'Please select an LLM' });
        }

        // Validate LLM exists and is active
        const llmDoc = await LLM.findById(llm);
        if (!llmDoc) {
            return res.status(404).json({ message: 'Selected LLM not found' });
        }
        if (!llmDoc.isActive) {
            return res.status(400).json({ message: 'Cannot create industry under a deactivated LLM' });
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
            llm,
            name,
            slug: industrySlug,
            description,
            isActive: isActive !== undefined ? isActive : true,
        });

        const populatedIndustry = await Industry.findById(industry._id).populate('llm', 'name');
        res.status(201).json(populatedIndustry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update industry
// @route   PUT /api/industries/:id
// @access  Private/Admin
const updateIndustry = async (req, res) => {
    try {
        const { name, slug, description, llm, isActive } = req.body;
        const industry = await Industry.findById(req.params.id);

        if (!industry) {
            return res.status(404).json({ message: 'Industry not found' });
        }

        // If LLM is being updated, validate it
        if (llm && llm !== industry.llm.toString()) {
            const llmDoc = await LLM.findById(llm);
            if (!llmDoc) {
                return res.status(404).json({ message: 'Selected LLM not found' });
            }
            if (!llmDoc.isActive) {
                return res.status(400).json({ message: 'Cannot assign to a deactivated LLM' });
            }
            industry.llm = llm;
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

        await industry.save();
        const updatedIndustry = await Industry.findById(industry._id).populate('llm', 'name');
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
