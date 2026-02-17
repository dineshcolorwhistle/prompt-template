const ExpertRequest = require('../models/ExpertRequest');
const User = require('../models/User');

// @desc    Submit a request to become an expert
// @route   POST /api/expert-requests
// @access  Private
exports.createRequest = async (req, res) => {
    try {
        const { details } = req.body;

        const existingRequest = await ExpertRequest.findOne({ user: req.user._id, status: 'Pending' });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request.' });
        }

        const request = await ExpertRequest.create({
            user: req.user._id,
            details,
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all expert requests (Admin only)
// @route   GET /api/expert-requests
// @access  Private/Admin
exports.getRequests = async (req, res) => {
    try {
        const requests = await ExpertRequest.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or reject an expert request
// @route   PUT /api/expert-requests/:id
// @access  Private/Admin
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // status should be 'Approved' or 'Rejected'

        const request = await ExpertRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = status;
        await request.save();

        if (status === 'Approved') {
            const user = await User.findById(request.user);
            if (user) {
                user.role = 'Expert';
                await user.save();
            }
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
