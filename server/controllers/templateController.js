const Template = require('../models/Template');
const fs = require('fs');
const path = require('path');

// @desc    Get all templates (Admin) or Public (Approved only)
// @route   GET /api/templates
// @access  Public (Approved) / Private (Admin - all)
exports.getTemplates = async (req, res) => {
    try {
        const { search, industry, category, status, page, limit } = req.query;
        let query = {};

        // If not admin, only show Approved
        if (!req.user || req.user.role !== 'Admin') {
            query.status = 'Approved';
        } else if (status) {
            // Admin can filter by status
            query.status = { $regex: new RegExp(`^${status}$`, 'i') }; // Case-insensitive match
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (industry) query.industry = industry;
        if (category) query.category = category;

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 12;
        const skip = (pageNum - 1) * limitNum;

        const total = await Template.countDocuments(query);
        const pages = Math.ceil(total / limitNum);

        const templates = await Template.find(query)
            .populate('industry', 'name')
            .populate('category', 'name')
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({ result: templates, pages, total, page: pageNum });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
exports.createTemplate = async (req, res, next) => {
    try {
        const {
            title, description, industry, category, status,
            useCase, tone, outputFormat, structuralInstruction, basePromptText,
            repurposingIdeas
        } = req.body;

        let variables = [];
        if (req.body.variables) {
            try {
                variables = typeof req.body.variables === 'string' ? JSON.parse(req.body.variables) : req.body.variables;
            } catch (e) {
                console.error("Error parsing variables:", e);
                variables = []; // or handle error
            }
        }

        // --- VALIDATION START ---
        // 1. Variable Usage Validation
        const unusedVariables = [];
        variables.forEach(variable => {
            const pattern = `{{${variable.name}}}`;
            if (!basePromptText.includes(pattern)) {
                unusedVariables.push(variable.name);
            }
        });

        if (unusedVariables.length > 0) {
            return res.status(400).json({
                message: `Validation Error: The following variables are defined but not used in the Base Prompt: ${unusedVariables.join(', ')}`
            });
        }

        // 2. Sample Output Image Validation
        const sampleOutput = req.files ? req.files.map(file => file.path) : [];
        if (sampleOutput.length === 0) {
            return res.status(400).json({ message: 'Validation Error: At least one sample output image is required.' });
        }
        // --- VALIDATION END ---

        const template = await Template.create({
            user: req.user._id,
            title,
            description,
            industry,
            category,
            status: status || 'Draft',
            useCase,
            tone,
            outputFormat,
            structuralInstruction,
            basePromptText,
            variables,
            sampleOutput,
            repurposingIdeas
        });

        const populatedTemplate = await Template.findById(template._id)
            .populate('industry', 'name')
            .populate('category', 'name');

        res.status(201).json(populatedTemplate);
    } catch (error) {
        console.error("Create Template Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a template
// @route   PUT /api/templates/:id
// @access  Private (Owner only)
exports.updateTemplate = async (req, res, next) => {
    try {
        const {
            title, description, industry, category, status,
            useCase, tone, outputFormat, structuralInstruction, basePromptText,
            repurposingIdeas
        } = req.body;

        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        // Check ownership
        if (template.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(401).json({ message: 'Not authorized to update this template' });
        }

        if (title) template.title = title;
        if (description) template.description = description;
        if (industry) template.industry = industry;
        if (category) template.category = category;
        if (status) template.status = status;
        if (useCase) template.useCase = useCase;
        if (tone) template.tone = tone;
        if (outputFormat) template.outputFormat = outputFormat;
        if (structuralInstruction) template.structuralInstruction = structuralInstruction;
        if (basePromptText) template.basePromptText = basePromptText;
        if (repurposingIdeas) template.repurposingIdeas = repurposingIdeas;

        if (req.body.variables) {
            try {
                template.variables = typeof req.body.variables === 'string' ? JSON.parse(req.body.variables) : req.body.variables;
            } catch (e) {
                // ignore
            }
        }

        // --- VALIDATION START ---
        // 1. Variable Usage Validation
        // Use the updated basePromptText if provided, otherwise the existing one
        const promptToCheck = basePromptText !== undefined ? basePromptText : template.basePromptText;
        // Use updated variables if provided, otherwise existing
        const variablesToCheck = req.body.variables ? template.variables : template.variables;

        const unusedVariables = [];
        if (variablesToCheck && Array.isArray(variablesToCheck)) {
            variablesToCheck.forEach(variable => {
                const pattern = `{{${variable.name}}}`;
                if (!promptToCheck.includes(pattern)) {
                    unusedVariables.push(variable.name);
                }
            });
        }

        if (unusedVariables.length > 0) {
            return res.status(400).json({
                message: `Validation Error: The following variables are defined but not used in the Base Prompt: ${unusedVariables.join(', ')}`
            });
        }
        // --- VALIDATION END ---

        // Handle existing images to keep
        let existingImages = [];
        if (req.body.existingImages) {
            try {
                existingImages = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
                // Ensure it's an array of strings
                if (!Array.isArray(existingImages)) existingImages = [existingImages];
            } catch (e) {
                existingImages = [];
            }
        } else {
            // If existingImages is not sent, it might imply clearing them OR keeping all if no new files?
            // Usually forms send what should remain.
            // If we rely on req.files being present to change images...
            // But user might want to delete images without adding new ones.
            // So relying on `existingImages` array from frontend is best.
        }

        // However, usually API expects:
        // 1. New files in req.files
        // 2. List of kept old files in req.body.existingImages (or similar field)
        // If existingImages is not provided, we might assume we keep existing?
        // Let's implement logic: if existingImages is provided, use it. then append new files.
        // If not provided, but new files provided, replace all? OR append?
        // Standard behavior: replace all collection or specific add/remove endpoints.
        // Simplest for now:
        // User sends `existingImages` (array of paths) they want to keep.
        // And `req.files` for new ones.

        let newImages = [];
        if (req.files && req.files.length > 0) {
            newImages = req.files.map(file => file.path);
        }

        if (req.body.existingImages) {
            // Parse if string
            let kept = req.body.existingImages;
            if (typeof kept === 'string') {
                try {
                    kept = JSON.parse(kept);
                } catch (e) {
                    kept = [kept]; // absolute fallback
                }
            }
            if (!Array.isArray(kept)) kept = [kept];

            template.sampleOutput = [...kept, ...newImages];
        } else if (newImages.length > 0) {
            // Only new images, replace old? Or append?
            // If frontend sends existingImages empty array, it means delete all old.
            // If frontend doesn't send existingImages, maybe we preserve old?
            // Let's assume append if no existingImages field, but replace if explicit empty?
            // Actually, safer to just append if not specified, or use new if specified.
            // Let's go with: if new images, add them. To delete, we need explicit action.
            // But for MVP, let's just make sampleOutput = [...(template.sampleOutput || []), ...newImages] if existingImages undefined.
            // BUT, the user wants "preview with remove option".
            // Frontend will likely send the list of "kept" images.
            // So I will look for `existingImages`.
            if (template.sampleOutput && Array.isArray(template.sampleOutput)) {
                template.sampleOutput = [...template.sampleOutput, ...newImages];
            } else {
                template.sampleOutput = newImages;
            }
        }
        // If req.body.existingImages IS sent (even empty), we respect it later. 
        // Wait, multiple `if` blocks is messy.

        // Revised Logic:
        // 1. Get current images.
        // 2. If `existingImages` is in body, use that as base. Else use current.
        // 3. Append `newImages`.

        let currentBase = template.sampleOutput || [];
        // normalize to array if string (migration)
        if (typeof currentBase === 'string') currentBase = [currentBase];

        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'existingImages')) {
            let provided = req.body.existingImages;
            if (typeof provided === 'string') {
                try {
                    provided = JSON.parse(provided);
                } catch (e) {
                    // might be single string path
                    provided = [provided];
                }
            }
            if (!Array.isArray(provided)) provided = [provided];
            currentBase = provided;
        }

        template.sampleOutput = [...currentBase, ...newImages];

        // --- VALIDATION START (Image) ---
        if (!template.sampleOutput || template.sampleOutput.length === 0) {
            return res.status(400).json({ message: 'Validation Error: At least one sample output image is required.' });
        }
        // --- VALIDATION END ---

        await template.save();

        const updatedTemplate = await Template.findById(template._id)
            .populate('industry', 'name')
            .populate('category', 'name');

        res.json(updatedTemplate);
    } catch (error) {
        console.error("Update Template Error:", error);
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

        if (template.sampleOutput && template.sampleOutput.length > 0) {
            template.sampleOutput.forEach(imagePath => {
                const fullPath = path.resolve(__dirname, '..', imagePath);
                fs.access(fullPath, fs.constants.F_OK, (err) => {
                    if (!err) {
                        fs.unlink(fullPath, (unlinkErr) => {
                            if (unlinkErr) console.error("Failed to delete image:", fullPath, unlinkErr);
                        });
                    }
                });
            });
        }

        await template.deleteOne();
        res.json({ message: 'Template removed successfully' });
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

        // Access Control: Public/Expert can only see Approved templates, unless they are the owner
        const isOwner = req.user && template.user && template.user._id.toString() === req.user._id.toString();
        const isAdmin = req.user && req.user.role === 'Admin';

        if (template.status !== 'Approved' && !isOwner && !isAdmin) {
            return res.status(404).json({ message: 'Template not found or not approved' });
        }

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
        const match = {};
        if (req.user.role !== 'Admin') {
            match.user = req.user._id;
        }

        const stats = await Template.aggregate([
            { $match: match },
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
