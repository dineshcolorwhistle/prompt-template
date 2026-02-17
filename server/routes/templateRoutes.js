const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createTemplate,
    getMyTemplates,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    getTemplateStats
} = require('../controllers/templateController');

router.get('/my', protect, getMyTemplates);
router.get('/stats', protect, getTemplateStats);
router.post('/', protect, createTemplate);
router.route('/:id')
    .get(protect, getTemplateById)
    .put(protect, updateTemplate)
    .delete(protect, deleteTemplate);

module.exports = router;
