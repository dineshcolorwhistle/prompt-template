const Template = require('../models/Template');
const Rating = require('../models/Rating');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

/**
 * Check if an Expert user qualifies for Verified Expert status.
 * Criteria:
 *   1. Minimum 3 approved templates
 *   2. Minimum 50 total ratings across all their templates
 *   3. Average effectiveness score >= 70%
 *
 * Effectiveness scoring uses weighted midpoints:
 *   0-10 → 5,  10-50 → 30,  50-80 → 65,  80-100 → 90
 *
 * @param {string} userId - The user ID to check
 * @returns {boolean} Whether the user was upgraded
 */
const checkVerifiedExpert = async (userId) => {
    try {
        const user = await User.findById(userId);

        // Only check for Expert users who are not already verified
        if (!user || user.role !== 'Expert' || user.isVerifiedExpert) {
            return false;
        }

        // 1. Count approved templates
        const approvedTemplates = await Template.find({
            user: userId,
            status: 'Approved',
        }).select('_id');

        if (approvedTemplates.length < 3) {
            return false;
        }

        const templateIds = approvedTemplates.map(t => t._id);

        // 2 & 3. Aggregate total ratings + weighted average across all approved templates
        const ratingAgg = await Rating.aggregate([
            { $match: { templateId: { $in: templateIds } } },
            {
                $group: {
                    _id: null,
                    totalRatings: { $sum: 1 },
                    weightedSum: {
                        $sum: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$effectivenessRange', '0-10'] }, then: 5 },
                                    { case: { $eq: ['$effectivenessRange', '10-50'] }, then: 30 },
                                    { case: { $eq: ['$effectivenessRange', '50-80'] }, then: 65 },
                                    { case: { $eq: ['$effectivenessRange', '80-100'] }, then: 90 },
                                ],
                                default: 0,
                            },
                        },
                    },
                },
            },
        ]);

        if (!ratingAgg.length || ratingAgg[0].totalRatings < 50) {
            return false;
        }

        const { totalRatings, weightedSum } = ratingAgg[0];
        const averageScore = Math.round(weightedSum / totalRatings);

        if (averageScore < 70) {
            return false;
        }

        // All criteria met — upgrade!
        user.isVerifiedExpert = true;
        await user.save();

        console.log(`✅ User ${user.name} (${user._id}) upgraded to Verified Expert. Stats: ${approvedTemplates.length} templates, ${totalRatings} ratings, ${averageScore}% avg.`);

        // Send congratulations email
        try {
            await sendEmail({
                email: user.email,
                subject: '🎉 Congratulations! You are now a Verified Expert',
                message: `Hi ${user.name},\n\nGreat news! Based on your outstanding contributions, you have been automatically upgraded to Verified Expert status.\n\nYour achievements:\n• ${approvedTemplates.length} approved templates\n• ${totalRatings} total ratings received\n• ${averageScore}% average effectiveness score\n\nAs a Verified Expert, your profile now displays a verification badge, giving your templates extra credibility.\n\nKeep up the great work!\n\n– The PromptMarket Team`,
            });
        } catch (emailError) {
            console.error('Failed to send Verified Expert email:', emailError);
        }

        return true;
    } catch (error) {
        console.error('checkVerifiedExpert error:', error);
        return false;
    }
};

module.exports = checkVerifiedExpert;
