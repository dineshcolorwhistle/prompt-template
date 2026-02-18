const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a variable name'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    defaultValue: {
        type: String,
        required: [true, 'Please add a default value'],
    },
    isRequired: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Variable', variableSchema);
