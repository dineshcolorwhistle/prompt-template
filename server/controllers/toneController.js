const Tone = require('../models/Tone');

const generateSlug = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

const getTones = async (req, res) => {
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

        const totalItems = await Tone.countDocuments(query);
        const tones = await Tone.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            result: tones,
            page: pageNum,
            pages: Math.ceil(totalItems / limitNum),
            total: totalItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getToneById = async (req, res) => {
    try {
        const tone = await Tone.findById(req.params.id);
        if (!tone) {
            return res.status(404).json({ message: 'Tone not found' });
        }
        res.status(200).json(tone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTone = async (req, res) => {
    try {
        const { name, description, slug, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Please provide a name' });
        }

        let toneSlug = slug ? generateSlug(slug) : generateSlug(name);

        const slugExists = await Tone.findOne({ slug: toneSlug });
        if (slugExists) {
            return res.status(400).json({ message: 'Slug already exists. Please choose another name or slug.' });
        }

        const nameExists = await Tone.findOne({ name });
        if (nameExists) {
            return res.status(400).json({ message: 'Tone with this name already exists' });
        }

        const tone = await Tone.create({
            name,
            slug: toneSlug,
            description,
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json(tone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTone = async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;
        const tone = await Tone.findById(req.params.id);

        if (!tone) {
            return res.status(404).json({ message: 'Tone not found' });
        }

        if (name) tone.name = name;
        if (description !== undefined) tone.description = description;
        if (isActive !== undefined) tone.isActive = isActive;

        if (slug) {
            const newSlug = generateSlug(slug);
            if (newSlug !== tone.slug) {
                const slugExists = await Tone.findOne({ slug: newSlug });
                if (slugExists && slugExists._id.toString() !== req.params.id) {
                    return res.status(400).json({ message: 'Slug already exists' });
                }
                tone.slug = newSlug;
            }
        }

        await tone.save();
        res.status(200).json(tone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTone = async (req, res) => {
    try {
        const tone = await Tone.findById(req.params.id);

        if (!tone) {
            return res.status(404).json({ message: 'Tone not found' });
        }

        if (tone.isActive) {
            return res.status(400).json({
                message: 'Cannot delete an active tone. Please deactivate it first.'
            });
        }

        await tone.deleteOne();

        res.status(200).json({ message: 'Tone permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTones,
    getToneById,
    createTone,
    updateTone,
    deleteTone,
};
