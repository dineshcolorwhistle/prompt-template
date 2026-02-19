import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import AdminTemplateModal from '../components/AdminTemplateModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { listVariants, itemVariants } from '../animations';

const Templates = () => {
    const { userInfo } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);


    // Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        templateId: null,
        title: ''
    });

    useEffect(() => {
        if (!userInfo?.token) return;
        fetchTemplates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo?.token]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setTemplates(Array.isArray(data) ? data : (data.result || []));
            } else {
                toast.error(data.message || 'Failed to fetch templates');
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (template) => {
        setDeleteModal({
            isOpen: true,
            templateId: template._id,
            title: template.title
        });
    };

    const handleDelete = async () => {
        const id = deleteModal.templateId;
        if (!id) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            if (response.ok) {
                setTemplates(templates.filter(t => t._id !== id));
                toast.success('Template deleted successfully');
            } else {
                toast.error('Failed to delete template');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while deleting');
        } finally {
            setDeleteModal({ isOpen: false, templateId: null, title: '' });
        }
    };

    const handleOpenModal = (template = null) => {
        setCurrentTemplate(template);
        setIsModalOpen(true);
    };

    const handleSave = (savedTemplate) => {
        if (currentTemplate) {
            setTemplates(templates.map(t => t._id === savedTemplate._id ? savedTemplate : t));
            toast.success('Template updated successfully');
        } else {
            setTemplates([savedTemplate, ...templates]);
            toast.success('Template created successfully');
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-700';
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Templates</h1>
                    <p className="text-gray-500">Create, edit, and approve templates.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Create Template
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        >
                            <option value="All">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>


                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Title</th>
                                <th className="px-6 py-3">Industry</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Author</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <tbody>
                                <tr><td colSpan="6" className="p-6 text-center text-gray-500">Loading templates...</td></tr>
                            </tbody>
                        ) : filteredTemplates.length === 0 ? (
                            <tbody>
                                <tr><td colSpan="6" className="p-6 text-center text-gray-500">No templates found.</td></tr>
                            </tbody>
                        ) : (
                            <motion.tbody
                                key={`tbody-${filteredTemplates.length}`}
                                className="divide-y divide-gray-100"
                                variants={listVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {filteredTemplates.map((template) => (
                                    <motion.tr
                                        key={template._id}
                                        variants={itemVariants}
                                        className="hover:bg-gray-50 group"
                                    >
                                        <td className="px-6 py-3 font-medium text-gray-900">{template.title}</td>
                                        <td className="px-6 py-3 text-gray-600">{template.industry?.name || '-'}</td>
                                        <td className="px-6 py-3 text-gray-600">{template.category?.name || '-'}</td>
                                        <td className="px-6 py-3 text-gray-600">{template.user?.name || 'Unknown'}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                                                {template.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(template)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(template)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </motion.tbody>
                        )}
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <AdminTemplateModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        template={currentTemplate}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDelete}
                title="Delete Template"
                message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

export default Templates;
