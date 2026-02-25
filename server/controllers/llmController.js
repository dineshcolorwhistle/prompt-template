const LLM = require('../models/LLM');
const fs = require('fs');
const path = require('path');

// Helper to slugify text
const generateSlug = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// @desc    Get all LLMs
// @route   GET /api/llms
// @access  Public
const getLLMs = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
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

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const totalItems = await LLM.countDocuments(query);
        const llms = await LLM.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            result: llms,
            page: pageNum,
            pages: Math.ceil(totalItems / limitNum),
            total: totalItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single LLM
// @route   GET /api/llms/:id
// @access  Public
const getLLMById = async (req, res) => {
    try {
        const llm = await LLM.findById(req.params.id);
        if (!llm) {
            return res.status(404).json({ message: 'LLM not found' });
        }
        res.status(200).json(llm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new LLM
// @route   POST /api/llms
// @access  Private/Admin
const createLLM = async (req, res) => {
    try {
        const { name, description, slug, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Please provide a name' });
        }

        let llmSlug = slug ? generateSlug(slug) : generateSlug(name);

        const slugExists = await LLM.findOne({ slug: llmSlug });
        if (slugExists) {
            return res.status(400).json({ message: 'Slug already exists. Please choose another name or slug.' });
        }

        const nameExists = await LLM.findOne({ name });
        if (nameExists) {
            return res.status(400).json({ message: 'LLM with this name already exists' });
        }

        const llmData = {
            name,
            slug: llmSlug,
            description,
            isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
        };

        // Handle uploaded logo file
        if (req.file) {
            llmData.icon = req.file.path.replace(/\\/g, '/');
        }

        const llm = await LLM.create(llmData);

        res.status(201).json(llm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update LLM
// @route   PUT /api/llms/:id
// @access  Private/Admin
const updateLLM = async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;
        const llm = await LLM.findById(req.params.id);

        if (!llm) {
            return res.status(404).json({ message: 'LLM not found' });
        }

        if (name) llm.name = name;
        if (description !== undefined) llm.description = description;
        if (isActive !== undefined) llm.isActive = (isActive === 'true' || isActive === true);

        // Handle uploaded logo file
        if (req.file) {
            // Delete old logo file if it exists
            if (llm.icon) {
                const oldPath = path.join(__dirname, '..', llm.icon);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            llm.icon = req.file.path.replace(/\\/g, '/');
        }

        // Handle logo removal (user cleared the logo)
        if (req.body.removeLogo === 'true' && !req.file) {
            if (llm.icon) {
                const oldPath = path.join(__dirname, '..', llm.icon);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            llm.icon = '';
        }

        if (slug) {
            const newSlug = generateSlug(slug);
            if (newSlug !== llm.slug) {
                const slugExists = await LLM.findOne({ slug: newSlug });
                if (slugExists && slugExists._id.toString() !== req.params.id) {
                    return res.status(400).json({ message: 'Slug already exists' });
                }
                llm.slug = newSlug;
            }
        }

        const updatedLLM = await llm.save();
        res.status(200).json(updatedLLM);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Hard Delete LLM (Only if Inactive)
// @route   DELETE /api/llms/:id
// @access  Private/Admin
const deleteLLM = async (req, res) => {
    try {
        const llm = await LLM.findById(req.params.id);

        if (!llm) {
            return res.status(404).json({ message: 'LLM not found' });
        }

        // Check if LLM is active
        if (llm.isActive) {
            return res.status(400).json({
                message: 'Cannot delete an active LLM. Please deactivate it first.'
            });
        }

        // Hard delete
        await llm.deleteOne();

        res.status(200).json({ message: 'LLM permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLLMs,
    getLLMById,
    createLLM,
    updateLLM,
    deleteLLM,
};
