import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TemplateModal = ({ isOpen, onClose, template, onSave }) => {
    const { userInfo } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        industry: '',
        category: '',
        content: '',
        status: 'Draft' // Default
    });
    const [industries, setIndustries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (template) {
            setFormData({
                title: template.title || '',
                description: template.description || '',
                industry: template.industry?._id || template.industry || '',
                category: template.category?._id || template.category || '',
                content: template.content || '',
                status: template.status || 'Draft'
            });
        } else {
            setFormData({
                title: '',
                description: '',
                industry: '',
                category: '',
                content: '',
                status: 'Draft'
            });
        }
    }, [template, isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchIndustries();
            fetchCategories();
        }
    }, [isOpen]);

    const fetchIndustries = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/industries`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const data = await response.json();
            setIndustries(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories?limit=100`, { // Fetching all for now, ideally filter by industry
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const data = await response.json();
            // Expected data format might be { result: [], ... } based on previous steps
            setCategories(data.result || data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save template');
            }

            onSave(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Filter categories based on selected industry
    const filteredCategories = formData.industry
        ? categories.filter(cat => (cat.industry?._id || cat.industry) === formData.industry)
        : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                    <h3 className="font-bold text-gray-900 text-lg">
                        {template ? 'Edit Template' : 'Create New Template'}
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

                    <form id="templateForm" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. SEO Blog Post Generator"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Pending">Publish (Pending Review)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                <select
                                    name="industry"
                                    required
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">Select Industry</option>
                                    {industries.map(ind => (
                                        <option key={ind._id} value={ind._id}>{ind.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    disabled={!formData.industry}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                >
                                    <option value="">Select Category</option>
                                    {filteredCategories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                required
                                rows={2}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="Briefly describe what this template does..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Content</label>
                            <textarea
                                name="content"
                                required
                                rows={8}
                                value={formData.content}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                placeholder="Enter your prompt here. Use {{variable}} for placeholders."
                            />
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

export default TemplateModal;
