const Category = require('../models/Category');

// Helper to slugify text
const generateSlug = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public (or Protected)
const getCategories = async (req, res) => {
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

        const totalItems = await Category.countDocuments(query);
        const categories = await Category.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.status(200).json({
            result: categories,
            page: pageNum,
            pages: Math.ceil(totalItems / limitNum),
            total: totalItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name, description, slug, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Please provide a name' });
        }

        // Generate slug
        let categorySlug = slug ? generateSlug(slug) : generateSlug(name);

        // Ensure slug is unique
        const slugExists = await Category.findOne({ slug: categorySlug });
        if (slugExists) {
            return res.status(400).json({ message: 'Slug already exists. Please choose another name or slug.' });
        }

        const category = await Category.create({
            name,
            slug: categorySlug,
            description,
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    try {
        const { name, slug, description, isActive } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        if (slug) {
            const newSlug = generateSlug(slug);
            if (newSlug !== category.slug) {
                const slugExists = await Category.findOne({ slug: newSlug });
                if (slugExists && slugExists._id.toString() !== req.params.id) {
                    return res.status(400).json({ message: 'Slug already exists' });
                }
                category.slug = newSlug;
            }
        }

        await category.save();
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete category (Hard delete if inactive)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (category.isActive) {
            return res.status(400).json({
                message: 'Cannot delete an active category. Please deactivate it first.'
            });
        }

        await category.deleteOne();

        res.status(200).json({ message: 'Category deleted permanently' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
