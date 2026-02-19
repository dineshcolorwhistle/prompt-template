import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Upload, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminTemplateModal = ({ isOpen, onClose, template, onSave }) => {
    const { userInfo } = useAuth();
    // Initial state
    const initialFormState = {
        title: '',
        description: '',
        industry: '',
        category: '',
        basePromptText: '',
        status: 'Pending',
        useCase: '',
        tone: '',
        outputFormat: '',
        structuralInstruction: '',
        repurposingIdeas: '',
        variables: [] // Array of objects: { name, description, defaultValue, required }
    };

    const [formData, setFormData] = useState(initialFormState);
    const [sampleOutputs, setSampleOutputs] = useState([]); // Array of File objects
    const [sampleOutputPreviews, setSampleOutputPreviews] = useState([]); // Array of strings (URLs/DataURLs)
    const [existingImages, setExistingImages] = useState([]); // Array of strings (URLs from DB)

    const [industries, setIndustries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // State for new variable input
    const [newVariable, setNewVariable] = useState({
        name: '',
        description: '',
        defaultValue: '',
        required: false
    });
    const [editingVariableIndex, setEditingVariableIndex] = useState(null);

    useEffect(() => {
        if (template) {
            setFormData({
                title: template.title || '',
                description: template.description || '',
                industry: template.industry?._id || template.industry || '',
                category: template.category?._id || template.category || '',
                basePromptText: template.basePromptText || template.content || '',
                status: template.status || 'Pending',
                useCase: template.useCase || '',
                tone: template.tone || '',
                outputFormat: template.outputFormat || '',
                structuralInstruction: template.structuralInstruction || '',
                repurposingIdeas: template.repurposingIdeas || '',
                variables: Array.isArray(template.variables) ? template.variables : []
            });
            // Handle multiple images
            let imgs = template.sampleOutput;
            if (imgs && !Array.isArray(imgs)) imgs = [imgs];
            setExistingImages(imgs || []);
        } else {
            setFormData(initialFormState);
            setExistingImages([]);
        }
        setSampleOutputs([]);
        setSampleOutputPreviews([]);
        setNewVariable({ name: '', description: '', defaultValue: '', required: false });
        setEditingVariableIndex(null);
    }, [template, isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchIndustries();
            fetchCategories();
        }
    }, [isOpen]);

    const fetchIndustries = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/industries`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const data = await res.json();
            setIndustries(data.result || []);
        } catch (err) {
            console.error("Error fetching industries:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories?limit=100`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const data = await res.json();
            setCategories(data.result || data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            toast.error("You can only upload a maximum of 5 images.");
            return;
        }

        const totalImages = existingImages.length + sampleOutputs.length + files.length;
        if (totalImages > 5) {
            toast.error(`You can only have a maximum of 5 images. You currently have ${existingImages.length + sampleOutputs.length}.`);
            return;
        }

        setSampleOutputs(prev => [...prev, ...files]);

        const newPreviews = files.map(file => {
            const reader = new FileReader();
            return new Promise(resolve => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newPreviews).then(results => {
            setSampleOutputPreviews(prev => [...prev, ...results]);
        });
    };

    const removeNewImage = (index) => {
        const newOutputs = [...sampleOutputs];
        newOutputs.splice(index, 1);
        setSampleOutputs(newOutputs);

        const newPreviews = [...sampleOutputPreviews];
        newPreviews.splice(index, 1);
        setSampleOutputPreviews(newPreviews);
    };

    const removeExistingImage = (index) => {
        const newExisting = [...existingImages];
        newExisting.splice(index, 1);
        setExistingImages(newExisting);
    };

    // Variable Management Handlers
    const handleAddVariable = () => {
        if (!newVariable.name.trim() || !newVariable.description.trim()) {
            toast.error("Name and Description are required for a variable.");
            return;
        }

        // Check for duplicate names
        if (formData.variables.some((v, i) => v.name === newVariable.name.trim() && i !== editingVariableIndex)) {
            toast.error("A variable with this name already exists.");
            return;
        }

        if (editingVariableIndex !== null) {
            setFormData(prev => {
                const updatedVariables = [...prev.variables];
                updatedVariables[editingVariableIndex] = { ...newVariable, name: newVariable.name.trim() };
                return { ...prev, variables: updatedVariables };
            });
            setEditingVariableIndex(null);
            toast.success("Variable updated successfully");
        } else {
            setFormData(prev => ({
                ...prev,
                variables: [...prev.variables, { ...newVariable, name: newVariable.name.trim() }]
            }));
        }

        setNewVariable({ name: '', description: '', defaultValue: '', required: false });
    };

    const handleEditVariable = (index) => {
        setNewVariable(formData.variables[index]);
        setEditingVariableIndex(index);
    };

    const handleCancelEdit = () => {
        setNewVariable({ name: '', description: '', defaultValue: '', required: false });
        setEditingVariableIndex(null);
    };

    const handleRemoveVariable = (index) => {
        setFormData(prev => ({
            ...prev,
            variables: prev.variables.filter((_, i) => i !== index)
        }));
    };

    const handleNewVariableChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewVariable(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // --- VALIDATION START ---
        // 1. Variable Usage Validation
        const unusedVariables = [];
        formData.variables.forEach(variable => {
            const pattern = `{{${variable.name}}}`;
            if (!formData.basePromptText.includes(pattern)) {
                unusedVariables.push(variable.name);
            }
        });

        if (unusedVariables.length > 0) {
            toast.error(`The following variables are not used in the Base Prompt: ${unusedVariables.join(', ')}`);
            setLoading(false);
            return;
        }

        // 2. Sample Output Image Validation
        const totalImages = existingImages.length + sampleOutputs.length;
        if (totalImages === 0) {
            toast.error('At least one sample output image is required.');
            setLoading(false);
            return;
        }
        // --- VALIDATION END ---

        try {
            const url = template
                ? `${import.meta.env.VITE_API_URL}/api/templates/${template._id}`
                : `${import.meta.env.VITE_API_URL}/api/templates`;

            const method = template ? 'PUT' : 'POST';

            const data = new FormData();
            for (const key in formData) {
                if (key === 'variables') {
                    data.append('variables', JSON.stringify(formData.variables));
                } else {
                    data.append(key, formData[key]);
                }
            }

            // Append existing images JSON to be handled by backend
            if (existingImages.length > 0) {
                data.append('existingImages', JSON.stringify(existingImages));
            } else {
                if (template) {
                    data.append('existingImages', JSON.stringify([]));
                }
            }

            sampleOutputs.forEach(file => {
                data.append('sampleOutput', file);
            });

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: data
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save template');
            }

            toast.success(template ? 'Template updated successfully' : 'Template created successfully');
            onSave(result);
            onClose();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // if (!isOpen) return null; // Handled by parent AnimatePresence

    const filteredCategories = formData.industry
        ? categories.filter(cat => (cat.industry?._id || cat.industry) === formData.industry)
        : [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
            >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                    <h3 className="font-bold text-gray-900 text-lg">
                        {template ? 'Edit Template (Admin)' : 'Create Template (Admin)'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">


                    <form id="templateForm" onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title<span className="text-red-500 ml-1">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Industry<span className="text-red-500 ml-1">*</span></label>
                                <select
                                    name="industry"
                                    required
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select Industry</option>
                                    {industries.map(ind => (
                                        <option key={ind._id} value={ind._id}>{ind.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category<span className="text-red-500 ml-1">*</span></label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    disabled={!formData.industry}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                >
                                    <option value="">Select Category</option>
                                    {filteredCategories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description<span className="text-red-500 ml-1">*</span></label>
                            <textarea
                                name="description"
                                required
                                rows={2}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Use Case<span className="text-red-500 ml-1">*</span></label>
                                <textarea name="useCase" required value={formData.useCase} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Locked Tone<span className="text-red-500 ml-1">*</span></label>
                                <textarea name="tone" required value={formData.tone} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Locked Output Format<span className="text-red-500 ml-1">*</span></label>
                                <textarea name="outputFormat" required value={formData.outputFormat} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Locked Structural Instruction<span className="text-red-500 ml-1">*</span></label>
                                <textarea name="structuralInstruction" required value={formData.structuralInstruction} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" />
                            </div>
                        </div>

                        {/* Variables Section (New) */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h4 className="font-medium text-gray-800 mb-4">Template Variables</h4>

                            {/* List of Added Variables */}
                            {formData.variables.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {formData.variables.map((v, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200 shadow-sm">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                                <div><span className="font-semibold text-gray-600">Name:</span> {v.name}</div>
                                                <div><span className="font-semibold text-gray-600">Desc:</span> {v.description}</div>
                                                <div><span className="font-semibold text-gray-600">Default:</span> {v.defaultValue || '-'}</div>
                                                <div><span className="font-semibold text-gray-600">Req:</span> {v.required ? 'Yes' : 'No'}</div>
                                            </div>
                                            <div className="flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditVariable(index)}
                                                    className="text-indigo-500 hover:bg-indigo-50 p-1 rounded transition ml-2"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVariable(index)}
                                                    className="text-red-500 hover:bg-red-50 p-1 rounded transition ml-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add New Variable Form */}
                            <div className="bg-white p-4 rounded border border-gray-200">
                                <h5 className="text-sm font-medium text-gray-700 mb-3">
                                    {editingVariableIndex !== null ? 'Edit Variable' : 'Add New Variable'}
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Variable Name (e.g. Industry)"
                                        value={newVariable.name}
                                        onChange={handleNewVariableChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="Description"
                                        value={newVariable.description}
                                        onChange={handleNewVariableChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <input
                                        type="text"
                                        name="defaultValue"
                                        placeholder="Default Value (Optional)"
                                        value={newVariable.defaultValue}
                                        onChange={handleNewVariableChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <label className="flex items-center gap-2 text-sm text-gray-700 px-1">
                                        <input
                                            type="checkbox"
                                            name="required"
                                            checked={newVariable.required}
                                            onChange={handleNewVariableChange}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        Required
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAddVariable}
                                        className="flex-1 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition flex items-center justify-center gap-2"
                                    >
                                        {editingVariableIndex !== null ? <Save size={16} /> : <Plus size={16} />}
                                        {editingVariableIndex !== null ? 'Update Variable' : 'Add Variable'}
                                    </button>
                                    {editingVariableIndex !== null && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition flex items-center justify-center"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Prompt Text<span className="text-red-500 ml-1">*</span></label>
                            <textarea
                                name="basePromptText"
                                required
                                rows={8}
                                value={formData.basePromptText}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                placeholder="Write the prompt here using {{variables}}..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Use the variable names defined above in double curly braces, e.g. {`{{VariableName}}`}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Repurposing Ideas</label>
                            <textarea
                                name="repurposingIdeas"
                                rows={3}
                                value={formData.repurposingIdeas}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sample Output (Images - Max 5)</label>
                            <div className="space-y-4">
                                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 transition w-fit">
                                    <Upload size={16} />
                                    Choose Images
                                    <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                                </label>

                                <div className="flex flex-wrap gap-4">
                                    {/* Existing Images */}
                                    {existingImages.map((img, index) => (
                                        <div key={`existing-${index}`} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}/${img.replace(/\\/g, '/')}`}
                                                alt={`Existing ${index}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* New Images */}
                                    {sampleOutputPreviews.map((preview, index) => (
                                        <div key={`new-${index}`} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 flex-shrink-0 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="templateForm"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save size={16} />
                                Save Template
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminTemplateModal;
