import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, FileText, Edit2, Trash2, Eye } from 'lucide-react';
import TemplateModal from '../components/TemplateModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { listVariants, itemVariants } from '../animations';

const MyTemplates = () => {
    const { userInfo } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // New filters
    const [llmFilter, setLlmFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Dropdown options
    const [llms, setLlms] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [categories, setCategories] = useState([]);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, title: '', message: '' });

    useEffect(() => {
        if (!userInfo?.token) return;
        const controller = new AbortController();
        const loadTemplates = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/my`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                    signal: controller.signal
                });
                const data = await response.json();
                if (response.ok) {
                    setTemplates(Array.isArray(data) ? data : []);
                } else {
                    toast.error(data.message || 'Failed to fetch templates');
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    toast.error('Failed to fetch templates');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        loadTemplates();
        fetchLlms();
        fetchIndustries();
        fetchCategories();
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo?.token]);

    const fetchLlms = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/llms?status=active&limit=100`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
            const data = await res.json();
            if (res.ok) setLlms(data.result || data);
        } catch (e) { }
    };

    const fetchIndustries = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/industries?status=active&limit=1000`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
            const data = await res.json();
            if (res.ok) setIndustries(data.result || data);
        } catch (e) { }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories?status=active&limit=1000`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
            const data = await res.json();
            if (res.ok) setCategories(data.result || data);
        } catch (e) { }
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        setIsModalOpen(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setIsModalOpen(true);
    };

    const handleSave = (savedTemplate) => {
        if (editingTemplate) {
            setTemplates(templates.map(t => t._id === savedTemplate._id ? savedTemplate : t));
            toast.success('Template updated successfully');
        } else {
            setTemplates([savedTemplate, ...templates]);
            toast.success('Template created successfully');
        }
    };

    const initiateDelete = (id, title) => {
        setConfirmModal({
            isOpen: true,
            id,
            title: 'Delete Template',
            message: `Are you sure you want to delete "${title}"? This action cannot be undone.`
        });
    };

    const handleDelete = async () => {
        if (!confirmModal.id) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${confirmModal.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            if (response.ok) {
                setTemplates(templates.filter(t => t._id !== confirmModal.id));
                toast.success('Template deleted');
            } else {
                toast.error('Failed to delete template');
            }
        } catch (err) {
            toast.error('Error deleting template');
        } finally {
            setConfirmModal({ isOpen: false, id: null, title: '', message: '' });
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLlm = llmFilter === 'all' || (t.llm?._id || t.llm) === llmFilter;
        const matchesIndustry = industryFilter === 'all' || (t.industry?._id || t.industry) === industryFilter;
        const matchesCategory = categoryFilter === 'all' || (t.category?._id || t.category) === categoryFilter;

        return matchesSearch && matchesLlm && matchesIndustry && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={handleDelete}
                onClose={() => setConfirmModal({ isOpen: false, id: null, title: '', message: '' })}
                confirmText="Delete"
                isDestructive={true}
            />

            <AnimatePresence>
                {isModalOpen && (
                    <TemplateModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        template={editingTemplate}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Templates</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and organize your prompt templates.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    <Plus size={20} className="mr-2" />
                    Create Template
                </button>
            </div>

            {(!loading && templates.length > 0) && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search your templates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                value={llmFilter}
                                onChange={(e) => setLlmFilter(e.target.value)}
                                className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="all">All LLMs</option>
                                {llms.map(llm => (
                                    <option key={llm._id} value={llm._id}>{llm.name}</option>
                                ))}
                            </select>

                            <select
                                value={industryFilter}
                                onChange={(e) => setIndustryFilter(e.target.value)}
                                className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="all">All Industries</option>
                                {industries.map(ind => (
                                    <option key={ind._id} value={ind._id}>{ind.name}</option>
                                ))}
                            </select>

                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 border-dashed"
                >
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {templates.length === 0 ? 'No templates found' : 'No matching templates'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">
                        {templates.length === 0
                            ? 'Get started by creating your first prompt template.'
                            : 'Try adjusting your search terms.'}
                    </p>
                    {templates.length === 0 && (
                        <button
                            onClick={handleCreate}
                            className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                            Create New Template
                        </button>
                    )}
                    {templates.length > 0 && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                            Clear Search
                        </button>
                    )}
                </motion.div>
            ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Industry / Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                key={`tbody-${filteredTemplates.length}`}
                                className="divide-y divide-gray-100 dark:divide-gray-800"
                                variants={listVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {filteredTemplates.map((template) => (
                                    <motion.tr
                                        key={template._id}
                                        variants={itemVariants}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{template.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{template.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-gray-200">{template.industry?.name || '-'}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{template.category?.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${template.status === 'Approved' ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30' :
                                                template.status === 'Draft' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600' :
                                                    'bg-yellow-50 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30'
                                                }`}>
                                                {template.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(template.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => initiateDelete(template._id, template.title)}
                                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTemplates;
