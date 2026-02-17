import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, FileText, Edit2, Trash2, Eye } from 'lucide-react';
import TemplateModal from '../components/TemplateModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';

const MyTemplates = () => {
    const { userInfo } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, title: '' });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/my`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (err) {
            console.error('Failed to fetch templates', err);
        } finally {
            setLoading(false);
        }
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
            setToast({ message: 'Template updated successfully', type: 'success' });
        } else {
            setTemplates([savedTemplate, ...templates]);
            setToast({ message: 'Template created successfully', type: 'success' });
        }
    };

    const initiateDelete = (id, title) => {
        setConfirmModal({
            isOpen: true,
            id,
            title: `Delete "${title}"?`,
            message: 'Are you sure you want to delete this template? This action cannot be undone.'
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
                setToast({ message: 'Template deleted', type: 'success' });
            } else {
                setToast({ message: 'Failed to delete template', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Error deleting template', type: 'error' });
        } finally {
            setConfirmModal({ isOpen: false, id: null, title: '' });
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={handleDelete}
                onCancel={() => setConfirmModal({ isOpen: false, id: null, title: '' })}
                confirmText="Delete"
                isDanger={true}
            />

            <TemplateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                template={editingTemplate}
                onSave={handleSave}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Templates</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and organize your prompt templates.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    <Plus size={20} className="mr-2" />
                    Create Template
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search your templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading templates...</div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
                    <p className="text-gray-500 mt-1 mb-4">Get started by creating your first prompt template.</p>
                    <button
                        onClick={handleCreate}
                        className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                        Create New Template
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Industry / Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTemplates.map((template) => (
                                    <tr key={template._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{template.title}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{template.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{template.industry?.name || '-'}</div>
                                            <div className="text-xs text-gray-500">{template.category?.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${template.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    template.status === 'Draft' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {template.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(template.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(template)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => initiateDelete(template._id, template.title)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTemplates;
