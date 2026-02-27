const Template = require('../models/Template');
const Industry = require('../models/Industry');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const checkVerifiedExpert = require('../utils/checkVerifiedExpert');

// Helper: Move files from temp to uploads/templates/{templateId}/
const moveFilesToTemplateDir = async (tempPaths, templateId) => {
    const templateDir = path.resolve(__dirname, '..', 'uploads', 'templates', templateId.toString());

    // Create directory if it doesn't exist (mode 0755 so web server can traverse)
    if (!fs.existsSync(templateDir)) {
        await fsPromises.mkdir(templateDir, { recursive: true, mode: 0o755 });
    }

    const newPaths = [];
    for (const tempPath of tempPaths) {
        const fileName = path.basename(tempPath);
        const newPath = path.join('uploads', 'templates', templateId.toString(), fileName).replace(/\\/g, '/');
        const fullOldPath = path.resolve(__dirname, '..', tempPath);
        const fullNewPath = path.resolve(__dirname, '..', newPath);

        try {
            await fsPromises.rename(fullOldPath, fullNewPath);
        } catch (err) {
            // If rename fails (cross-device), fall back to copy + delete
            await fsPromises.copyFile(fullOldPath, fullNewPath);
            await fsPromises.unlink(fullOldPath);
        }
        // Ensure file is readable by web server (e.g. when process runs as different user on VPS)
        await fsPromises.chmod(fullNewPath, 0o644).catch(() => { });
        newPaths.push(newPath);
    }
    return newPaths;
};

// @desc    Get all templates (Admin) or Public (Approved only)
// @route   GET /api/templates
// @access  Public (Approved) / Private (Admin - all)
exports.getTemplates = async (req, res) => {
    try {
        const { search, industry, category, status, llm, page, limit } = req.query;
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

        // LLM filter: find all industries under this LLM, then filter templates
        if (llm) {
            const llmIndustries = await Industry.find({ llm, isActive: true }).select('_id');
            const industryIds = llmIndustries.map(ind => ind._id);
            query.industry = { $in: industryIds };
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
            .populate({
                path: 'industry',
                select: 'name llm',
                populate: { path: 'llm', select: 'name' }
            })
            .populate('category', 'name')
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Bulk-fetch average effectiveness ratings for all templates in this page
        const templateIds = templates.map(t => t._id);
        const ratingAggregation = await Rating.aggregate([
            { $match: { templateId: { $in: templateIds } } },
            {
                $group: {
                    _id: '$templateId',
                    totalRatings: { $sum: 1 },
                    // Weighted average using midpoints: 0-10→5, 10-50→30, 50-80→65, 80-100→90
                    weightedSum: {
                        $sum: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$effectivenessRange', '0-10'] }, then: 5 },
                                    { case: { $eq: ['$effectivenessRange', '10-50'] }, then: 30 },
                                    { case: { $eq: ['$effectivenessRange', '50-80'] }, then: 65 },
                                    { case: { $eq: ['$effectivenessRange', '80-100'] }, then: 90 },
                                ],
                                default: 0,
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    totalRatings: 1,
                    averageScore: { $round: [{ $divide: ['$weightedSum', '$totalRatings'] }, 0] },
                },
            },
        ]);

        // Build a map of templateId → rating info
        const ratingMap = {};
        ratingAggregation.forEach(r => {
            ratingMap[r._id.toString()] = {
                averageScore: r.averageScore,
                totalRatings: r.totalRatings,
            };
        });

        // Merge rating info into each template
        const templatesWithRatings = templates.map(t => {
            const tObj = t.toObject();
            tObj.ratingInfo = ratingMap[t._id.toString()] || { averageScore: null, totalRatings: 0 };
            return tObj;
        });

        res.json({ result: templatesWithRatings, pages, total, page: pageNum });
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
            .populate({
                path: 'industry',
                select: 'name llm',
                populate: { path: 'llm', select: 'name' }
            })
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
        const tempPaths = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];
        if (tempPaths.length === 0) {
            return res.status(400).json({ message: 'Validation Error: At least one sample output image is required.' });
        }
        if (tempPaths.length > 5) {
            // Clean up uploaded temp files since we're rejecting
            tempPaths.forEach(filePath => {
                const fullPath = path.resolve(__dirname, '..', filePath);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            });
            return res.status(400).json({ message: 'Validation Error: A maximum of 5 sample output images are allowed.' });
        }
        // --- VALIDATION END ---

        // Create template first (with temp paths temporarily)
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
            sampleOutput: tempPaths, // temporary
            repurposingIdeas
        });

        // Move files from temp to uploads/templates/{templateId}/
        const finalPaths = await moveFilesToTemplateDir(tempPaths, template._id);
        template.sampleOutput = finalPaths;
        await template.save();

        const populatedTemplate = await Template.findById(template._id)
            .populate({
                path: 'industry',
                select: 'name llm',
                populate: { path: 'llm', select: 'name' }
            })
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
                if (!Array.isArray(existingImages)) existingImages = [existingImages];
            } catch (e) {
                existingImages = [];
            }
        }

        // New files are in temp — will be moved to template dir
        let tempNewImages = [];
        if (req.files && req.files.length > 0) {
            tempNewImages = req.files.map(file => file.path.replace(/\\/g, '/'));
        }

        // Determine base images: if existingImages sent, use it; otherwise keep current
        let currentBase = template.sampleOutput || [];
        if (typeof currentBase === 'string') currentBase = [currentBase];

        if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'existingImages')) {
            let provided = req.body.existingImages;
            if (typeof provided === 'string') {
                try {
                    provided = JSON.parse(provided);
                } catch (e) {
                    provided = [provided];
                }
            }
            if (!Array.isArray(provided)) provided = [provided];

            // Clean up orphaned files (images in old list but not in kept list)
            const removedImages = currentBase.filter(img => !provided.includes(img));
            removedImages.forEach(imagePath => {
                try {
                    const fullPath = path.resolve(__dirname, '..', imagePath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }
                } catch (err) {
                    console.error(`Failed to delete orphaned image: ${imagePath}`, err.message);
                }
            });

            currentBase = provided;
        }

        // Enforce max 5 images (before moving files)
        if (currentBase.length + tempNewImages.length > 5) {
            // Clean up temp uploaded files since we're rejecting
            tempNewImages.forEach(filePath => {
                const fullPath = path.resolve(__dirname, '..', filePath);
                if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            });
            return res.status(400).json({
                message: `Validation Error: A maximum of 5 images are allowed. You have ${currentBase.length} existing + ${tempNewImages.length} new = ${currentBase.length + tempNewImages.length} total.`
            });
        }

        // Move new files from temp to uploads/templates/{templateId}/
        let movedNewImages = [];
        if (tempNewImages.length > 0) {
            movedNewImages = await moveFilesToTemplateDir(tempNewImages, template._id);
        }

        template.sampleOutput = [...currentBase, ...movedNewImages];

        // --- VALIDATION (Image min 1) ---
        if (!template.sampleOutput || template.sampleOutput.length === 0) {
            return res.status(400).json({ message: 'Validation Error: At least one sample output image is required.' });
        }
        // --- VALIDATION END ---

        await template.save();

        // If template was just approved, check if the owner qualifies for Verified Expert
        if (status === 'Approved') {
            checkVerifiedExpert(template.user.toString()).catch(err =>
                console.error('Verified Expert check failed:', err)
            );
        }

        const updatedTemplate = await Template.findById(template._id)
            .populate({
                path: 'industry',
                select: 'name llm',
                populate: { path: 'llm', select: 'name' }
            })
            .populate('category', 'name');

        res.json(updatedTemplate);
    } catch (error) {
        console.error("Update Template Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a template and all associated data (images, comments, ratings)
// @route   DELETE /api/templates/:id
// @access  Private (Owner or Admin)
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

        const templateId = template._id;
        const cleanupSummary = { images: 0, comments: 0, ratings: 0 };

        // 1. Delete the entire template image folder
        const templateDir = path.resolve(__dirname, '..', 'uploads', 'templates', templateId.toString());
        try {
            if (fs.existsSync(templateDir)) {
                const files = await fsPromises.readdir(templateDir);
                cleanupSummary.images = files.length;
                await fsPromises.rm(templateDir, { recursive: true, force: true });
            }
        } catch (err) {
            console.error(`Failed to delete template folder: ${templateDir}`, err.message);
        }

        // Also clean up any legacy images that aren't in the template folder
        if (template.sampleOutput && template.sampleOutput.length > 0) {
            for (const imagePath of template.sampleOutput) {
                if (!imagePath.includes(`templates/${templateId.toString()}`)) {
                    try {
                        const fullPath = path.resolve(__dirname, '..', imagePath);
                        if (fs.existsSync(fullPath)) {
                            await fsPromises.unlink(fullPath);
                            cleanupSummary.images++;
                        }
                    } catch (err) {
                        if (err.code !== 'ENOENT') {
                            console.error(`Failed to delete legacy image: ${imagePath}`, err.message);
                        }
                    }
                }
            }
        }

        // 2. Delete all associated comments (including nested replies)
        const commentResult = await Comment.deleteMany({ templateId });
        cleanupSummary.comments = commentResult.deletedCount;

        // 3. Delete all associated ratings
        const ratingResult = await Rating.deleteMany({ templateId });
        cleanupSummary.ratings = ratingResult.deletedCount;

        // 4. Delete the template document
        await template.deleteOne();

        console.log(`Template ${templateId} deleted. Cleanup: ${cleanupSummary.images} images, ${cleanupSummary.comments} comments, ${cleanupSummary.ratings} ratings removed.`);

        res.json({
            message: 'Template and all associated data removed successfully',
            cleanup: cleanupSummary
        });
    } catch (error) {
        console.error('Delete Template Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Private
exports.getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id)
            .populate({
                path: 'industry',
                select: 'name llm',
                populate: { path: 'llm', select: 'name' }
            })
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
