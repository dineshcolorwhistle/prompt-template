const mongoose = require('mongoose');

const outputFormatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the output format'],
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

module.exports = mongoose.model('OutputFormat', outputFormatSchema);
