import React, { useState, useEffect, useRef } from 'react';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Search, Edit2, Trash2, X, Info,
    Filter, Power, CheckCircle, Briefcase, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';

const Categories = () => {
    const { userInfo } = useAuth();
    const [categories, setCategories] = useState([]);
    const [llms, setLlms] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [allIndustries, setAllIndustries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [llmFilter, setLlmFilter] = useState('all');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // UI States
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: '', action: null });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        llm: '',
        industry: '',
        slug: '',
        description: '',
        isActive: true
    });
    const [formIndustries, setFormIndustries] = useState([]);
    const [formLoading, setFormLoading] = useState(false);

    // Debounce search term
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        fetchLlms();
        fetchAllIndustries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (llmFilter === 'all') {
            setIndustries(allIndustries);
        } else {
            setIndustries(allIndustries.filter(ind => ind.llm?._id === llmFilter || ind.llm === llmFilter));
        }
        setIndustryFilter('all');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [llmFilter, allIndustries]);

    useEffect(() => {
        if (isModalOpen) {
            fetchFormIndustries(formData.llm);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.llm, isModalOpen]);

    const prevFiltersRef = useRef({ debouncedSearchTerm, statusFilter, industryFilter, llmFilter });
    useEffect(() => {
        const filtersChanged =
            prevFiltersRef.current.debouncedSearchTerm !== debouncedSearchTerm ||
            prevFiltersRef.current.statusFilter !== statusFilter ||
            prevFiltersRef.current.industryFilter !== industryFilter ||
            prevFiltersRef.current.llmFilter !== llmFilter;
        prevFiltersRef.current = { debouncedSearchTerm, statusFilter, industryFilter, llmFilter };

        if (filtersChanged && page !== 1) {
            setPage(1);
            return;
        }

        fetchCategories();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearchTerm, statusFilter, industryFilter, llmFilter]);

    const fetchLlms = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/llms?status=active&limit=1000`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setLlms(data.result || (Array.isArray(data) ? data : []));
            }
        } catch (err) {
            console.error("Failed to fetch LLMs", err);
        }
    };

    const fetchAllIndustries = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/industries?status=active&limit=1000`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const result = data.result || (Array.isArray(data) ? data : []);
                setAllIndustries(result);
                setIndustries(result);
            }
        } catch (err) {
            console.error("Failed to fetch industries", err);
        }
    };

    const fetchFormIndustries = async (llmId) => {
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/industries?status=active&limit=1000`;
            if (llmId) {
                url += `&llm=${llmId}`;
            }
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFormIndustries(data.result || (Array.isArray(data) ? data : []));
            }
        } catch (err) {
            console.error("Failed to fetch form industries", err);
        }
    };

    const fetchCategories = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/categories?page=${page}&limit=10&`;
            if (debouncedSearchTerm) url += `search=${debouncedSearchTerm}&`;
            if (statusFilter !== 'all') url += `status=${statusFilter}&`;
            if (industryFilter !== 'all') url += `industry=${industryFilter}&`;
            if (llmFilter !== 'all') url += `llm=${llmFilter}&`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) throw new Error('Failed to fetch categories');

            const data = await response.json();

            if (data.result) {
                setCategories(data.result);
                setTotalPages(data.pages);
                setTotalItems(data.total);
            } else {
                setCategories(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
                toast.error('Failed to load categories');
            }
        } finally {
            if (!abortControllerRef.current?.signal.aborted) {
                setLoading(false);
            }
        }
    };

    // Form Handlers
    const handleOpenModal = (category = null) => {
        if (category) {
            setCurrentCategory(category);
            const industryLlmId = category.industry?.llm?._id || category.industry?.llm || '';
            setFormData({
                name: category.name,
                llm: industryLlmId,
                industry: category.industry?._id || '',
                slug: category.slug,
                description: category.description || '',
                isActive: category.isActive
            });
        } else {
            setCurrentCategory(null);
            setFormData({
                name: '',
                llm: '',
                industry: '',
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
        setFormData({ name: '', llm: '', industry: '', slug: '', description: '', isActive: true });
        setFormIndustries([]);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };

            if (name === 'llm') {
                newData.industry = '';
            }

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
                ? `${import.meta.env.VITE_API_URL}/api/categories/${currentCategory._id}`
                : `${import.meta.env.VITE_API_URL}/api/categories`;

            const method = currentCategory ? 'PUT' : 'POST';

            const { llm, ...submitData } = formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(submitData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            toast.success(currentCategory ? 'Category updated successfully' : 'Category created successfully');
            handleCloseModal();
            fetchCategories();
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
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${confirmModal.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`
                    },
                    body: JSON.stringify({ isActive: false })
                });

                if (!response.ok) throw new Error('Failed to deactivate');
                toast.success('Category deactivated successfully');

            } else if (confirmModal.action === 'delete') {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${confirmModal.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to delete');
                }
                toast.success('Category deleted permanently');
            }

            fetchCategories();
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage categories within industries.</p>
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
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                    {/* LLM Filter */}
                    <div className="relative flex-1 sm:w-44">
                        <Cpu className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <select
                            value={llmFilter}
                            onChange={(e) => setLlmFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                        >
                            <option value="all">All LLMs</option>
                            {llms.map(llm => (
                                <option key={llm._id} value={llm._id}>{llm.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Industry Filter */}
                    <div className="relative flex-1 sm:w-48">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <select
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                        >
                            <option value="all">All Industries</option>
                            {industries.map(ind => (
                                <option key={ind._id} value={ind._id}>{ind.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* Status Filter */}
                    <div className="relative flex-1 sm:w-40">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">LLM</th>
                                <th className="px-6 py-4">Industry</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex justify-center items-center flex-col">
                                            <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                                            <p>Loading categories...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                                <Search className="text-gray-400 dark:text-gray-500" size={24} />
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">No categories found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : categories.map((item) => (
                                <tr
                                    key={item._id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                                >
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900 dark:text-white block">{item.name}</span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{item.slug}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400">
                                            {item.industry?.llm?.name || '—'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
                                            {item.industry?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${item.isActive
                                            ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>

                                            {item.isActive ? (
                                                <button
                                                    onClick={() => initiateAction(item._id, item.name, item.isActive, 'deactivate')}
                                                    className="p-2 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                                                    title="Deactivate"
                                                >
                                                    <Power size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => initiateAction(item._id, item.name, item.isActive, 'delete')}
                                                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
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

            {/* Pagination */
                !loading && categories.length > 0 && (
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
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto border border-transparent dark:border-gray-800"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 z-10">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {currentCategory ? 'Edit Category' : 'Add New Category'}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* LLM Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        LLM <span className="text-xs font-normal text-gray-400 dark:text-gray-500">(Filter industries)</span>
                                    </label>
                                    <select
                                        name="llm"
                                        value={formData.llm}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">All LLMs</option>
                                        {llms.map(llm => (
                                            <option key={llm._id} value={llm._id}>{llm.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                        <Info size={12} /> Select an LLM to filter the industry list below
                                    </p>
                                </div>

                                {/* Industry Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Industry <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="industry"
                                        required
                                        value={formData.industry}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="">Select Industry</option>
                                        {formIndustries.map(ind => (
                                            <option key={ind._id} value={ind._id}>{ind.name}</option>
                                        ))}
                                    </select>
                                    {formData.llm && formIndustries.length === 0 && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                                            <Info size={12} /> No active industries found for the selected LLM
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="e.g. AI & Robotics"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Slug <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        required
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors bg-gray-50 dark:bg-gray-800 font-mono text-sm text-gray-600 dark:text-gray-400"
                                        placeholder="e.g. ai-and-robotics"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                                        <Info size={12} /> Unique identifier.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                        Description <span className="text-xs font-normal text-gray-400 dark:text-gray-500">(Optional)</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                        placeholder="Brief description..."
                                    />
                                </div>

                                {/* Modern Toggle Switch */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Status</label>
                                    <div
                                        className="flex items-center cursor-pointer group w-fit"
                                        onClick={() => handleToggleStatus(!formData.isActive)}
                                    >
                                        <div className={`relative w-12 h-6 transition-colors duration-200 ease-in-out rounded-full border-2 border-transparent ${formData.isActive ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                            <span
                                                aria-hidden="true"
                                                className={`inline-block w-5 h-5 transform bg-white rounded-full shadow ring-0 transition duration-200 ease-in-out ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}
                                            />
                                        </div>
                                        <span className={`ml-3 text-sm font-medium ${formData.isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {formData.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium text-sm"
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Categories;
