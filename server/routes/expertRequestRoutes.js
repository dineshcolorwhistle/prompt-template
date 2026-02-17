const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { createRequest, getRequests, updateRequestStatus } = require('../controllers/expertRequestController');

router.post('/', protect, createRequest);
router.get('/', protect, admin, getRequests);
router.put('/:id', protect, admin, updateRequestStatus);

module.exports = router;
