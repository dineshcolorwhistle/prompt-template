const mongoose = require('mongoose');

const llmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name for the LLM'],
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
    icon: {
        type: String, // URL or icon identifier for the LLM
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('LLM', llmSchema);
