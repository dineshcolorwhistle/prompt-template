const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerifiedExpert: user.isVerifiedExpert,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate a temporary random password since user sets it later
        // The user cannot login with this password as they don't know it
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
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        if (user) {
            // Create reset URL
            const resetUrl = `http://localhost:5173/set-password/${resetToken}`;

            const message = `
        <h1>You have requested a new account</h1>
        <p>Please click the link below to set your password and activate your account:</p>
        <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Set Password - Prompt Template Platform',
                    message: `Please copy and paste the following link in your browser to set your password: ${resetUrl}`,
                    html: message,
                });

                res.status(201).json({
                    success: true,
                    message: 'Email sent with password setting instructions',
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
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set Password
// @route   PUT /api/users/setpassword/:resetToken
// @access  Public
const setPassword = async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { authUser, registerUser, setPassword };
