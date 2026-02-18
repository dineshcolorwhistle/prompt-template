const Variable = require('../models/Variable');

// @desc    Get all variables
// @route   GET /api/variables
// @access  Public (or Protected - prompt says admin for CRUD, but template usage probably needs public access?? 
//          Actually prompt says "Only templates with Status = approved are visible to end users." 
//          Variables are parts of templates. Admin needs full CRUD.)
const getVariables = async (req, res) => {
    try {
        const variables = await Variable.find().sort({ createdAt: -1 });
        res.status(200).json(variables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single variable
// @route   GET /api/variables/:id
// @access  Public/Admin
const getVariableById = async (req, res) => {
    try {
        const variable = await Variable.findById(req.params.id);
        if (!variable) {
            return res.status(404).json({ message: 'Variable not found' });
        }
        res.status(200).json(variable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new variable
// @route   POST /api/variables
// @access  Private/Admin
const createVariable = async (req, res) => {
    try {
        const { name, description, defaultValue, isRequired } = req.body;

        if (!name || !defaultValue) {
            return res.status(400).json({ message: 'Please provide name and default value' });
        }

        const variableExists = await Variable.findOne({ name });
        if (variableExists) {
            return res.status(400).json({ message: 'Variable name already exists' });
        }

        const variable = await Variable.create({
            name,
            description,
            defaultValue,
            isRequired
        });

        res.status(201).json(variable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update variable
// @route   PUT /api/variables/:id
// @access  Private/Admin
const updateVariable = async (req, res) => {
    try {
        const { name, description, defaultValue, isRequired } = req.body;
        const variable = await Variable.findById(req.params.id);

        if (!variable) {
            return res.status(404).json({ message: 'Variable not found' });
        }

        if (name && name !== variable.name) {
            const variableExists = await Variable.findOne({ name });
            if (variableExists) {
                return res.status(400).json({ message: 'Variable name already exists' });
            }
            variable.name = name;
        }

        if (description !== undefined) variable.description = description;
        if (defaultValue !== undefined) variable.defaultValue = defaultValue;
        if (isRequired !== undefined) variable.isRequired = isRequired;

        const updatedVariable = await variable.save();
        res.status(200).json(updatedVariable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete variable
// @route   DELETE /api/variables/:id
// @access  Private/Admin
const deleteVariable = async (req, res) => {
    try {
        const variable = await Variable.findById(req.params.id);
        if (!variable) {
            return res.status(404).json({ message: 'Variable not found' });
        }

        await variable.deleteOne();
        res.status(200).json({ message: 'Variable deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getVariables,
    getVariableById,
    createVariable,
    updateVariable,
    deleteVariable
};
