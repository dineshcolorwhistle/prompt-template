const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    industry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Industry',
        required: [true, 'Please select an industry'],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please select a category'],
    },
    useCase: {
        type: String,
    },
    tone: {
        type: String, // Locked tone
    },
    outputFormat: {
        type: String, // Locked output format
    },
    structuralInstruction: {
        type: String, // Locked structural instruction
    },
    basePromptText: {
        type: String, // BasePromptText
        required: [true, 'Please add base prompt text'],
    },
    variables: [{
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        defaultValue: {
            type: String,
        },
        required: {
            type: Boolean,
            default: false,
        },
    }],
    sampleOutput: {
        type: [String], // Image URLs/paths
        validate: {
            validator: function (val) {
                return val.length <= 5;
            },
            message: 'A template can have a maximum of 5 sample output images.'
        }
    },
    repurposingIdeas: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
        default: 'Draft',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

templateSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
