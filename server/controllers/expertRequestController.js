const ExpertRequest = require('../models/ExpertRequest');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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

        // Send notification to all admins
        try {
            const admins = await User.find({ role: 'Admin' });
            for (const admin of admins) {
                await sendEmail({
                    email: admin.email,
                    subject: 'New Expert Request',
                    message: `A new expert request has been submitted by ${req.user.name}.\n\nDetails: ${details}\n\nPlease check the admin dashboard to review.`,
                });
            }
        } catch (emailError) {
            console.error('Failed to send admin notification email:', emailError);
            // Don't fail the request if email fails, just log it
        }

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
                user.isVerifiedExpert = false; // Initially provisional
                await user.save();

                // Send approval email to the user
                try {
                    await sendEmail({
                        email: user.email,
                        subject: 'Expert Request Approved',
                        message: `Congratulations! Your request to become an expert has been approved. You now have access to expert features.`,
                    });
                } catch (emailError) {
                    console.error('Failed to send approval email:', emailError);
                }
            }
        } else if (status === 'Rejected') {
            const user = await User.findById(request.user);
            if (user) {
                // Send rejection email to the user
                try {
                    await sendEmail({
                        email: user.email,
                        subject: 'Expert Request Update',
                        message: `Thank you for your interest in becoming an expert. After careful review, we regret to inform you that your request has been declined at this time.\n\nYou are welcome to apply again in the future with more details about your expertise.`,
                    });
                } catch (emailError) {
                    console.error('Failed to send rejection email:', emailError);
                }
            }
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an expert request
// @route   DELETE /api/expert-requests/:id
// @access  Private/Admin
exports.deleteRequest = async (req, res) => {
    try {
        const request = await ExpertRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        await request.deleteOne();
        res.json({ message: 'Request removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
