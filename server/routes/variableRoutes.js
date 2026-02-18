const express = require('express');
const router = express.Router();
const {
    getVariables,
    getVariableById,
    createVariable,
    updateVariable,
    deleteVariable,
} = require('../controllers/variableController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getVariables)
    .post(protect, admin, createVariable);

router.route('/:id')
    .get(protect, admin, getVariableById)
    .put(protect, admin, updateVariable)
    .delete(protect, admin, deleteVariable);

module.exports = router;
