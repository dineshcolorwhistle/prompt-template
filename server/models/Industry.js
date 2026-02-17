const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the industry'],
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: [true, 'Please add a slug'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Pre-save middleware to generate slug if not provided, though validation requires it.
// We'll handle slug generation in the controller or a pre-validate hook if needed, 
// but the requirement says "auto-generated from name, editable".
// So the controller will likely receive a slug or generate one.

module.exports = mongoose.model('Industry', industrySchema);
