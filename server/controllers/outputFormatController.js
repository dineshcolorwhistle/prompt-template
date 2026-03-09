const OutputFormat = require('../models/OutputFormat');

const generateSlug = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const getOutputFormats = async (req, res) => {
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

        const totalItems = await OutputFormat.countDocuments(query);
        const outputFormats = await OutputFormat.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            result: outputFormats,
            page: pageNum,
            pages: Math.ceil(totalItems / limitNum),
            total: totalItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOutputFormatById = async (req, res) => {
    try {
        const outputFormat = await OutputFormat.findById(req.params.id);
        if (!outputFormat) {
            return res.status(404).json({ message: 'Output Format not found' });
        }
        res.status(200).json(outputFormat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createOutputFormat = async (req, res) => {
    try {
        const { name, description, slug, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Please provide a name' });
        }

        let formatSlug = slug ? generateSlug(slug) : generateSlug(name);

        const slugExists = await OutputFormat.findOne({ slug: formatSlug });
        if (slugExists) {
            return res.status(400).json({ message: 'Slug already exists. Please choose another name or slug.' });
        }

        const nameExists = await OutputFormat.findOne({ name });
        if (nameExists) {
            return res.status(400).json({ message: 'Output Format with this name already exists' });
        }

        const outputFormat = await OutputFormat.create({
            name,
            slug: formatSlug,
            description,
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json(outputFormat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOutputFormat = async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;
        const outputFormat = await OutputFormat.findById(req.params.id);

        if (!outputFormat) {
            return res.status(404).json({ message: 'Output Format not found' });
        }

        if (name) outputFormat.name = name;
        if (description !== undefined) outputFormat.description = description;
        if (isActive !== undefined) outputFormat.isActive = isActive;

        if (slug) {
            const newSlug = generateSlug(slug);
            if (newSlug !== outputFormat.slug) {
                const slugExists = await OutputFormat.findOne({ slug: newSlug });
                if (slugExists && slugExists._id.toString() !== req.params.id) {
                    return res.status(400).json({ message: 'Slug already exists' });
                }
                outputFormat.slug = newSlug;
            }
        }

        await outputFormat.save();
        res.status(200).json(outputFormat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteOutputFormat = async (req, res) => {
    try {
        const outputFormat = await OutputFormat.findById(req.params.id);

        if (!outputFormat) {
            return res.status(404).json({ message: 'Output Format not found' });
        }

        if (outputFormat.isActive) {
            return res.status(400).json({
                message: 'Cannot delete an active output format. Please deactivate it first.'
            });
        }

        await outputFormat.deleteOne();

        res.status(200).json({ message: 'Output Format permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOutputFormats,
    getOutputFormatById,
    createOutputFormat,
    updateOutputFormat,
    deleteOutputFormat,
};
