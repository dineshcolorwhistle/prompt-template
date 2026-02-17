import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Search, Edit2, Trash2, X, Info,
    Filter, Power, CheckCircle, Briefcase
} from 'lucide-react';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';

const Categories = () => {
    const { userInfo } = useAuth();
    const [categories, setCategories] = useState([]);
    const [industries, setIndustries] = useState([]); // For dropdowns
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');

    // UI States
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: '', action: null });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        slug: '',
        description: '',
        isActive: true
    });
    const [formLoading, setFormLoading] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchIndustries();
        fetchCategories();
    }, [searchTerm, statusFilter, industryFilter]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchIndustries = async () => {
        try {
            // We need active industries for the "Add New" dropdown, 
            // but maybe all industries for the filter?
            // For now, let's just fetch all and filter in UI if needed.
            const response = await fetch('http://localhost:5000/api/industries?status=active', {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setIndustries(data);
            }
        } catch (err) {
            console.error("Failed to fetch industries", err);
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            let url = `http://localhost:5000/api/categories?`;
            if (searchTerm) url += `search=${searchTerm}&`;
            if (statusFilter !== 'all') url += `status=${statusFilter}&`;
            if (industryFilter !== 'all') url += `industry=${industryFilter}&`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error(err);
            showToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Form Handlers
    const handleOpenModal = (category = null) => {
        if (category) {
            setCurrentCategory(category);
            setFormData({
                name: category.name,
                industry: category.industry?._id || '', // Handle populated object
                slug: category.slug,
                description: category.description || '',
                isActive: category.isActive
            });
        } else {
            setCurrentCategory(null);
            setFormData({
                name: '',
                industry: '', // Must select an industry
                slug: '',
                description: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCategory(null);
        setFormData({ name: '', industry: '', slug: '', description: '', isActive: true });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };

            // Auto-generate slug logic
            if (name === 'name' && !currentCategory) {
                newData.slug = value.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }
            return newData;
        });
    };

    const handleToggleStatus = (val) => {
        setFormData(prev => ({ ...prev, isActive: val }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const url = currentCategory
                ? `http://localhost:5000/api/categories/${currentCategory._id}`
                : 'http://localhost:5000/api/categories';

            const method = currentCategory ? 'PUT' : 'POST';

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
                throw new Error(data.message || 'Something went wrong');
            }

            showToast(currentCategory ? 'Category updated successfully' : 'Category created successfully', 'success');
            handleCloseModal();
            fetchCategories();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const initiateAction = (id, name, isActive, action) => {
        if (action === 'deactivate') {
            setConfirmModal({
                isOpen: true,
                id,
                name,
                action: 'deactivate',
                title: 'Deactivate Category',
                message: `Are you sure you want to deactivate "${name}"? It will become inactive.`
            });
        } else if (action === 'delete') {
            setConfirmModal({
                isOpen: true,
                id,
                name,
                action: 'delete',
                title: 'Delete Category',
                message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`
            });
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.action) return;

        try {
            if (confirmModal.action === 'deactivate') {
                // Deactivate: Update isActive to false (via PUT update logic implies passing full body or handling partial. 
                // Our controller updateCategory handles partials)
                const response = await fetch(`http://localhost:5000/api/categories/${confirmModal.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`
                    },
                    body: JSON.stringify({ isActive: false })
                });

                if (!response.ok) throw new Error('Failed to deactivate');
                showToast('Category deactivated successfully', 'success');

            } else if (confirmModal.action === 'delete') {
                const response = await fetch(`http://localhost:5000/api/categories/${confirmModal.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to delete');
                }
                showToast('Category deleted permanently', 'success');
            }

            fetchCategories();
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            setConfirmModal({ isOpen: false, id: null, name: '', action: null });
        }
    };

    return (
        <div className="space-y-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmModal({ isOpen: false, id: null, name: '', action: null })}
                confirmText={confirmModal.action === 'delete' ? 'Delete' : 'Deactivate'}
                isDanger={true}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage categories within industries.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
                >
                    <Plus size={20} className="mr-2" />
                    Add Category
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="all">All Industries</option>
                            {industries.map(ind => (
                                <option key={ind._id} value={ind._id}>{ind.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative flex-1 sm:w-40">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Industry</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center flex-col">
                                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                                            <p>Loading categories...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <Search className="text-gray-400" size={24} />
                                            </div>
                                            <p className="font-medium text-gray-900">No categories found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900 block">{item.name}</span>
                                        <span className="text-xs text-gray-400 font-mono">{item.slug}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {item.industry?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.isActive
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            {item.isActive ? (
                                                <button
                                                    onClick={() => initiateAction(item._id, item.name, item.isActive, 'deactivate')}
                                                    className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="Deactivate"
                                                >
                                                    <Power size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => initiateAction(item._id, item.name, item.isActive, 'delete')}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Permanently"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden scale-in-95 animate-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-lg">
                                {currentCategory ? 'Edit Category' : 'Add New Category'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Industry <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="industry"
                                    required
                                    value={formData.industry}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                                >
                                    <option value="">Select Industry</option>
                                    {industries.map(ind => (
                                        <option key={ind._id} value={ind._id}>{ind.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                    placeholder="e.g. AI & Robotics"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Slug <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    required
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-gray-50 font-mono text-sm text-gray-600"
                                    placeholder="e.g. ai-and-robotics"
                                />
                                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                    <Info size={12} /> Unique identifier.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Description <span className="text-xs font-normal text-gray-400">(Optional)</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                                    placeholder="Brief description..."
                                />
                            </div>

                            {/* Modern Toggle Switch */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                                <div
                                    className="flex items-center cursor-pointer group w-fit"
                                    onClick={() => handleToggleStatus(!formData.isActive)}
                                >
                                    <div className={`relative w-12 h-6 transition-colors duration-200 ease-in-out rounded-full border-2 border-transparent ${formData.isActive ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                        <span
                                            aria-hidden="true"
                                            className={`inline-block w-5 h-5 transform bg-white rounded-full shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}
                                        />
                                    </div>
                                    <span className={`ml-3 text-sm font-medium ${formData.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {formData.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm flex items-center gap-2 shadow-sm hover:shadow"
                                >
                                    {formLoading ? (
                                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</>
                                    ) : (
                                        <><CheckCircle size={16} /> {currentCategory ? 'Save Changes' : 'Create Category'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
