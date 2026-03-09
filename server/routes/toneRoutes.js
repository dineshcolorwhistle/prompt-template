const express = require('express');
const router = express.Router();
const {
    getTones,
    getToneById,
    createTone,
    updateTone,
    deleteTone,
} = require('../controllers/toneController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getTones)
    .post(protect, admin, createTone);

router.route('/:id')
    .get(protect, getToneById)
    .put(protect, admin, updateTone)
    .delete(protect, admin, deleteTone);

module.exports = router;
