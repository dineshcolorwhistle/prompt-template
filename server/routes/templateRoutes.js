const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Ensure the temp upload directory exists (prevents ENOENT on production)
const tempUploadDir = path.join(__dirname, '..', 'uploads', 'templates', 'temp');
fs.mkdirSync(tempUploadDir, { recursive: true, mode: 0o755 });

// Configure Multer — uploads go to temp folder first, then moved to /templates/{id}/ by the controller
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempUploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E4) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
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
