const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const {
    toggleSaveTemplate,
    getSaveStatus,
    getSavedTemplates,
    getRatedTemplates,
    recordCopy,
    getCopyHistory,
    getUserLibraryStats,
} = require('../controllers/userLibraryController');

// Dashboard stats
router.get('/stats', protect, getUserLibraryStats);

// Saved templates
router.get('/saved', protect, getSavedTemplates);
router.get('/save/:templateId', optionalAuth, getSaveStatus);
router.post('/save/:templateId', protect, toggleSaveTemplate);

// Rated templates
router.get('/rated', protect, getRatedTemplates);

// Copy history
router.get('/copies', protect, getCopyHistory);
router.post('/copy/:templateId', protect, recordCopy);

module.exports = router;
