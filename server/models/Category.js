const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    industry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Industry',
        required: [true, 'Please select an industry'],
    },
    name: {
        type: String,
        required: [true, 'Please add a category name'],
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

module.exports = mongoose.model('Category', categorySchema);
