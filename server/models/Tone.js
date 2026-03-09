const mongoose = require('mongoose');

const toneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the tone'],
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

module.exports = mongoose.model('Tone', toneSchema);
