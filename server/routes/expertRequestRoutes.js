const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { createRequest, getRequests, updateRequestStatus, deleteRequest } = require('../controllers/expertRequestController');

router.post('/', protect, createRequest);
router.get('/', protect, admin, getRequests);
router.put('/:id', protect, admin, updateRequestStatus);
router.delete('/:id', protect, admin, deleteRequest);

module.exports = router;
