import React, { useState, useEffect, useRef } from 'react';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Search, Edit2, Trash2, X, AlertCircle,
    Filter, Power, CheckCircle, Info, Bot, Upload, ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';

const LLMs = () => {
    const { userInfo } = useAuth();
    const [llms, setLLMs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // UI States
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: '' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLLM, setCurrentLLM] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        isActive: true
    });
    const [formLoading, setFormLoading] = useState(false);

    // Logo upload state
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const fileInputRef = useRef(null);

    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const abortControllerRef = useRef(null);

    const prevFiltersRef = useRef({ debouncedSearchTerm, statusFilter });
    useEffect(() => {
        const filtersChanged =
            prevFiltersRef.current.debouncedSearchTerm !== debouncedSearchTerm ||
            prevFiltersRef.current.statusFilter !== statusFilter;
        prevFiltersRef.current = { debouncedSearchTerm, statusFilter };

        if (filtersChanged && page !== 1) {
            setPage(1);
            return;
        }

        fetchLLMs();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearchTerm, statusFilter]);

    const fetchLLMs = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/llms?page=${page}&limit=10&`;
            if (debouncedSearchTerm) url += `search=${debouncedSearchTerm}&`;
            if (statusFilter !== 'all') url += `status=${statusFilter}&`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) throw new Error('Failed to fetch LLMs');
            const data = await response.json();

            if (data.result) {
                setLLMs(data.result);
                setTotalPages(data.pages);
                setTotalItems(data.total);
            } else {
                setLLMs(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
                toast.error('Failed to load LLMs');
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    };

    // Form Handlers
    const handleOpenModal = (llm = null) => {
        if (llm) {
            setCurrentLLM(llm);
            setFormData({
                name: llm.name,
                slug: llm.slug,
                description: llm.description || '',
                isActive: llm.isActive
            });
            // Show existing logo as preview
            if (llm.icon) {
                setLogoPreview(`${import.meta.env.VITE_API_URL}/${llm.icon}`);
            } else {
                setLogoPreview(null);
            }
        } else {
            setCurrentLLM(null);
            setFormData({ name: '', slug: '', description: '', isActive: true });
            setLogoPreview(null);
        }
        setLogoFile(null);
        setRemoveLogo(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentLLM(null);
        setFormData({ name: '', slug: '', description: '', isActive: true });
        setLogoFile(null);
        setLogoPreview(null);
        setRemoveLogo(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };

            if (name === 'name' && !currentLLM) {
                newData.slug = value.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }
            return newData;
        });
    };

    const handleToggleStatus = (val) => {
        setFormData(prev => ({ ...prev, isActive: val }));
    };

    // File upload handlers
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo file must be less than 2MB');
                return;
            }
            if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/)) {
                toast.error('Only image files are allowed (JPG, PNG, GIF, WebP, SVG)');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setRemoveLogo(false);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        setRemoveLogo(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const url = currentLLM
                ? `${import.meta.env.VITE_API_URL}/api/llms/${currentLLM._id}`
                : `${import.meta.env.VITE_API_URL}/api/llms`;

            const method = currentLLM ? 'PUT' : 'POST';

            // Use FormData for file upload
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('slug', formData.slug);
            submitData.append('description', formData.description);
            submitData.append('isActive', formData.isActive);

            if (logoFile) {
                submitData.append('logo', logoFile);
            }

            if (removeLogo) {
                submitData.append('removeLogo', 'true');
            }

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${userInfo.token}`
                    // Note: DO NOT set Content-Type header — browser sets it with boundary for FormData
                },
                body: submitData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            toast.success(currentLLM ? 'LLM updated successfully' : 'LLM created successfully');
            handleCloseModal();
            fetchLLMs();
        } catch (err) {
            toast.error(err.message);
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
                title: 'Deactivate LLM',
                message: `Are you sure you want to deactivate "${name}"? It will become inactive.`
            });
        } else if (action === 'delete') {
            setConfirmModal({
                isOpen: true,
                id,
                name,
                action: 'delete',
                title: 'Delete LLM',
                message: `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`
            });
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.action) return;

        try {
            if (confirmModal.action === 'deactivate') {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/llms/${confirmModal.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`
                    },
                    body: JSON.stringify({ isActive: false })
                });

                if (!response.ok) throw new Error('Failed to deactivate');
                toast.success('LLM deactivated successfully');

            } else if (confirmModal.action === 'delete') {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/llms/${confirmModal.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to delete');
                }
                toast.success('LLM deleted permanently');
            }

            fetchLLMs();
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setConfirmModal({ isOpen: false, id: null, name: '', action: null });
        }
    };

    return (
        <div className="space-y-6 relative">
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={handleConfirmAction}
                onClose={() => setConfirmModal({ isOpen: false, id: null, name: '', action: null })}
                confirmText={confirmModal.action === 'delete' ? 'Delete' : 'Deactivate'}
                isDanger={true}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bot className="text-indigo-600" size={28} />
                        LLMs
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage Large Language Models for the platform.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
                >
                    <Plus size={20} className="mr-2" />
                    Add LLM
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search LLMs by name or slug..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400" size={20} />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white min-w-[150px] transition-colors"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Slug</th>
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
                                            <p>Loading LLMs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : llms.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <Search className="text-gray-400" size={24} />
                                            </div>
                                            <p className="font-medium text-gray-900">No LLMs found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : llms.map((item) => (
                                <tr
                                    key={item._id}
                                    className="hover:bg-gray-50 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.icon ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/${item.icon}`}
                                                    alt={item.name}
                                                    className="w-9 h-9 rounded-lg object-cover border border-gray-200 shadow-sm"
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
                                            ) : null}
                                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ${item.icon ? 'hidden' : ''}`}>
                                                {item.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 block">{item.name}</span>
                                                {item.description && (
                                                    <span className="text-xs text-gray-500 truncate max-w-[200px] block">{item.description}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{item.slug}</code>
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

            {/* Pagination */}
            {!loading && llms.length > 0 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalItems}
                    itemsPerPage={10}
                />
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
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
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 text-lg">
                                    {currentLLM ? 'Edit LLM' : 'Add New LLM'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        LLM Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                                        placeholder="e.g. ChatGPT"
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
                                        placeholder="e.g. chatgpt"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                        <Info size={12} /> Unique identifier for URLs/API.
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
                                        placeholder="Brief description of the LLM..."
                                    />
                                </div>

                                {/* Logo Upload */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Logo <span className="text-xs font-normal text-gray-400">(Optional, max 2MB)</span>
                                    </label>

                                    {logoPreview ? (
                                        <div className="relative group">
                                            <div className="w-full h-32 rounded-xl border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="max-h-28 max-w-full object-contain"
                                                />
                                            </div>
                                            <div className="absolute top-2 right-2 flex gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                    title="Change logo"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Remove logo"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50/50'); }}
                                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50'); }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/50');
                                                const file = e.dataTransfer.files[0];
                                                if (file) {
                                                    const fakeEvent = { target: { files: [file] } };
                                                    handleFileChange(fakeEvent);
                                                }
                                            }}
                                            className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                                                <Upload size={20} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">Click or drag to upload</p>
                                                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, GIF, WebP, SVG</p>
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                                        className="hidden"
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
                                            <><CheckCircle size={16} /> {currentLLM ? 'Save Changes' : 'Create LLM'}</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LLMs;
