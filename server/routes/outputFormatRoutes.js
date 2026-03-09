const express = require('express');
const router = express.Router();
const {
    getOutputFormats,
    getOutputFormatById,
    createOutputFormat,
    updateOutputFormat,
    deleteOutputFormat,
} = require('../controllers/outputFormatController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getOutputFormats)
    .post(protect, admin, createOutputFormat);

router.route('/:id')
    .get(protect, getOutputFormatById)
    .put(protect, admin, updateOutputFormat)
    .delete(protect, admin, deleteOutputFormat);

module.exports = router;
