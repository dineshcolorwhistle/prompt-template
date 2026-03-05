const User = require('../models/User');
const Template = require('../models/Template');
const ExpertRequest = require('../models/ExpertRequest');
const CopyHistory = require('../models/CopyHistory');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const totalItems = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            result: users,
            page: pageNum,
            pages: Math.ceil(totalItems / limitNum),
            total: totalItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new admin
// @route   POST /api/users/admin
// @access  Private/Admin
const addAdmin = async (req, res) => {
    try {
        const { name, email } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate a temporary random password
        const tempPassword = crypto.randomBytes(10).toString('hex');

        // Create reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.create({
            name,
            email,
            password: tempPassword,
            role: 'Admin',
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        if (user) {
            // Create reset URL
            const resetUrl = `http://localhost:5173/set-password/${resetToken}`;

            const message = `
                <h1>You have been invited as an Admin</h1>
                <p>Please click the link below to set your password and activate your account:</p>
                <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Admin Invitation - Prompt Template Platform',
                    message: `Please copy and paste the following link in your browser to set your password: ${resetUrl}`,
                    html: message,
                });

                res.status(201).json({
                    success: true,
                    message: 'Admin created and invitation email sent',
                });
            } catch (error) {
                console.error(error);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save({ validateBeforeSave: false });

                return res.status(500).json({ message: 'Email could not be sent' });
            }
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerifiedExpert: user.isVerifiedExpert,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Admin Dashboard Stats
// @route   GET /api/users/dashboard
// @access  Private/Admin
const getAdminDashboardOverview = async (req, res) => {
    try {
        const activeUsersCount = await User.countDocuments();
        const templatesCount = await Template.countDocuments();
        const pendingExpertRequests = await ExpertRequest.countDocuments({ status: 'Pending' });
        const totalPromptCopiedCount = await CopyHistory.countDocuments();

        // Template status distribution for donut chart
        const templateStatusData = await Template.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        const statusDistribution = templateStatusData.map(item => ({
            name: item._id,
            value: item.count
        }));

        // Monthly template creation trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyTrends = await Template.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: 1 },
                    approved: {
                        $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedTrends = monthlyTrends.map(item => ({
            month: monthNames[item._id.month - 1],
            total: item.total,
            approved: item.approved,
            pending: item.pending
        }));

        // Recent user registrations (last 5)
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt');

        // Recently updated template related details
        const recentTemplates = await Template.find()
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('title status updatedAt user')
            .populate('user', 'name email');

        // Approved templates count
        const approvedCount = await Template.countDocuments({ status: 'Approved' });
        const pendingCount = await Template.countDocuments({ status: 'Pending' });

        res.json({
            stats: {
                activeUsers: activeUsersCount,
                templates: templatesCount,
                pendingExpertRequests: pendingExpertRequests,
                promptCopied: totalPromptCopiedCount,
                approvedTemplates: approvedCount,
                pendingTemplates: pendingCount
            },
            chartData: {
                statusDistribution,
                monthlyTrends: formattedTrends,
                recentUsers
            },
            recentActions: recentTemplates
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUsers,
    addAdmin,
    deleteUser,
    getUserProfile,
    getAdminDashboardOverview
};
