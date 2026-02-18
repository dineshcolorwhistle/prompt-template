import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Upload, Search, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
        variables: [] // Array of IDs
    };

    const [formData, setFormData] = useState(initialFormState);
    const [sampleOutputs, setSampleOutputs] = useState([]); // Array of File objects
    const [sampleOutputPreviews, setSampleOutputPreviews] = useState([]); // Array of strings (URLs/DataURLs)
    const [existingImages, setExistingImages] = useState([]); // Array of strings (URLs from DB)

    const [industries, setIndustries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allVariables, setAllVariables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [variableSearch, setVariableSearch] = useState('');

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
                variables: template.variables ? template.variables.map(v => v._id || v) : []
            });
            // Handle multiple images (migration support: if string, make array)
            let imgs = template.sampleOutput;
            if (imgs && !Array.isArray(imgs)) imgs = [imgs];
            setExistingImages(imgs || []);
        } else {
            setFormData(initialFormState);
            setExistingImages([]);
        }
        setSampleOutputs([]);
        setSampleOutputPreviews([]);
    }, [template, isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchIndustries();
            fetchCategories();
            fetchVariables();
        }
    }, [isOpen]);

    const fetchIndustries = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/industries`, {
            headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        const data = await res.json();
        setIndustries(data.result || []);
    };

    const fetchCategories = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories?limit=100`, {
            headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        const data = await res.json();
        setCategories(data.result || data);
    };

    const fetchVariables = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/variables`, {
            headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setAllVariables(await res.json());
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            alert("You can only upload a maximum of 5 images.");
            return;
        }

        const totalImages = existingImages.length + sampleOutputs.length + files.length;
        if (totalImages > 5) {
            alert(`You can only have a maximum of 5 images. You currently have ${existingImages.length + sampleOutputs.length}.`);
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

    const handleVariableToggle = (varId) => {
        setFormData(prev => {
            if (prev.variables.includes(varId)) {
                return { ...prev, variables: prev.variables.filter(id => id !== varId) };
            } else {
                return { ...prev, variables: [...prev.variables, varId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

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
                // Send empty array explicitly if existingImages is empty but we are in edit mode
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

            onSave(result);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredCategories = formData.industry
        ? categories.filter(cat => (cat.industry?._id || cat.industry) === formData.industry)
        : [];

    const availableVariables = allVariables.filter(v =>
        v.name.toLowerCase().includes(variableSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                    <h3 className="font-bold text-gray-900 text-lg">
                        {template ? 'Edit Template (Admin)' : 'Create Template (Admin)'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

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
                                <input type="text" name="useCase" required value={formData.useCase} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Locked Tone<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="tone" required value={formData.tone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Locked Output Format<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="outputFormat" required value={formData.outputFormat} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Locked Structural Instruction<span className="text-red-500 ml-1">*</span></label>
                                <textarea name="structuralInstruction" required value={formData.structuralInstruction} onChange={handleChange} rows={1} className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" />
                            </div>
                        </div>

                        {/* Variables Selector */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h4 className="font-medium text-gray-800 mb-2">Linked Variables</h4>
                            <div className="flex gap-2 mb-2">
                                <Search size={16} className="text-gray-400 mt-2.5" />
                                <input
                                    type="text"
                                    placeholder="Search variables..."
                                    className="px-3 py-1.5 border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    value={variableSearch}
                                    onChange={e => setVariableSearch(e.target.value)}
                                />
                            </div>
                            <div className="bg-white border border-gray-200 rounded p-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availableVariables.map(v => (
                                    <label key={v._id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer group relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.variables.includes(v._id)}
                                            onChange={() => handleVariableToggle(v._id)}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-600">{`{{${v.name}}}`}</span>

                                        {/* Custom Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10 pointer-events-none">
                                            {v.description}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Select variables to be available in this template. Hover over a variable to see its description.</p>
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
            </div>
        </div>
    );
};

export default AdminTemplateModal;
