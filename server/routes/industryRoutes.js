const express = require('express');
const router = express.Router();
const {
    getIndustries,
    getIndustryById,
    createIndustry,
    updateIndustry,
    deleteIndustry,
} = require('../controllers/industryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public or Protected routes (List can be viewed by anyone or at least authenticated users)
// For Admin features, we definitely need protect + admin for mutations.
// Requirements say "Admin Features -> List view", implying this is an admin tool.
// But usually users need to pick an industry too.
// I'll leave GET open to authenticated users for now, or just public. 
// Assuming this is for the Admin Dashboard, protect+admin is safer for the specific management endpoints.

router.route('/')
    .get(protect, admin, getIndustries) // Admin list view
    .post(protect, admin, createIndustry);

router.route('/:id')
    .get(protect, getIndustryById)
    .put(protect, admin, updateIndustry)
    .delete(protect, admin, deleteIndustry); // Soft delete

module.exports = router;
