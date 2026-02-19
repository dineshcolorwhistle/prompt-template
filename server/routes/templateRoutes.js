const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
    createTemplate,
    getMyTemplates,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    getTemplateStats,
    getTemplates
} = require('../controllers/templateController');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

router.get('/', optionalAuth, getTemplates); // Public (Approved), Admin sees all if token passed
router.get('/my', protect, getMyTemplates);
router.get('/stats', protect, getTemplateStats);
router.post('/', protect, upload.array('sampleOutput', 5), createTemplate);
router.route('/:id')
    .get(optionalAuth, getTemplateById) // Public read for details page, but optional auth for ownership check etc.
    .put(protect, upload.array('sampleOutput', 5), updateTemplate)
    .delete(protect, deleteTemplate);

module.exports = router;
