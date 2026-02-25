const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getLLMs,
    getLLMById,
    createLLM,
    updateLLM,
    deleteLLM,
} = require('../controllers/llmController');
const { protect, admin } = require('../middleware/authMiddleware');

// Configure Multer for LLM logos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/llm-logos/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// GET is public (Homepage needs this), mutations are admin-only
router.route('/')
    .get(getLLMs)
    .post(protect, admin, upload.single('logo'), createLLM);

router.route('/:id')
    .get(getLLMById)
    .put(protect, admin, upload.single('logo'), updateLLM)
    .delete(protect, admin, deleteLLM);

module.exports = router;
