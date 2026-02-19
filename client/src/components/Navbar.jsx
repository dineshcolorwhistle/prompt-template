import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dropdownVariants } from '../animations';
import { Search, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, CheckCircle, BadgeCheck, Filter } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import RequestExpertModal from './RequestExpertModal';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const { userInfo, logout } = useAuth();
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Filters State
    const [industries, setIndustries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    const selectedIndustry = searchParams.get('industry') || '';
    const selectedCategory = searchParams.get('category') || '';

    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/industries?limit=100&status=active`);
                const data = await response.json();
                if (response.ok && data.result) {
                    setIndustries(data.result);
                }
            } catch (error) {
                console.error('Failed to fetch industries:', error);
            }
        };
        fetchIndustries();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!selectedIndustry) {
                setCategories([]);
                return;
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories?industry=${selectedIndustry}&limit=100&status=active`);
                const data = await response.json();
                if (response.ok && data.result) {
                    setCategories(data.result);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, [selectedIndustry]);

    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
    }, [searchParams]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleIndustryChange = (e) => {
        const newIndustry = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (newIndustry) {
            params.set('industry', newIndustry);
        } else {
            params.delete('industry');
        }
        params.delete('category'); // Reset category when industry changes
        params.delete('page'); // Reset to page 1
        navigate(`/?${params.toString()}`);
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (newCategory) {
            params.set('category', newCategory);
        } else {
            params.delete('category');
        }
        params.delete('page');
        navigate(`/?${params.toString()}`);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            const params = new URLSearchParams(searchParams);
            if (searchTerm) {
                params.set('search', searchTerm);
            } else {
                params.delete('search');
            }
            params.delete('page');
            navigate(`/?${params.toString()}`);
        }
    };

    const hasFilters = selectedIndustry || selectedCategory || searchTerm;

    const handleReset = () => {
        setSearchTerm('');
        navigate('/');
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full gap-4">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200">
                                P
                            </div>
                            <span className="text-xl font-bold text-gray-900 hidden lg:block">PromptMarket</span>
                        </Link>

                        {/* Desktop Search & Filters */}
                        <div className="hidden md:flex items-center flex-1 max-w-3xl gap-4 mx-4">
                            {/* Industry Dropdown */}
                            <div className="relative min-w-[140px]">
                                <select
                                    value={selectedIndustry}
                                    onChange={handleIndustryChange}
                                    className="w-full appearance-none pl-4 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                    <option value="">All Industries</option>
                                    {industries.map(ind => (
                                        <option key={ind._id} value={ind._id}>{ind.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Category Dropdown (Dependent) */}
                            <div className="relative min-w-[140px]">
                                <select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    disabled={!selectedIndustry}
                                    className={`w-full appearance-none pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 font-medium transition-colors ${!selectedIndustry ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 cursor-pointer hover:bg-gray-100'}`}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Search Bar */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleSearch}
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
                                />
                            </div>

                            {hasFilters && (
                                <button
                                    onClick={handleReset}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                    title="Reset Filters"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* User Profile / Actions */}
                        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
                            {userInfo ? (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 focus:outline-none p-1 rounded-full hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 relative">
                                            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={16} />}
                                            {userInfo.isVerifiedExpert && (
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                                    <BadgeCheck size={12} className="text-blue-600 fill-blue-50" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium text-sm max-w-[100px] truncate">{userInfo.name}</span>
                                        <ChevronDown size={14} className={`transform transition-transform ${isProfileOpen ? 'rotate-180' : ''} text-gray-400`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                variants={dropdownVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 origin-top-right z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{userInfo.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
                                                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 capitalize border border-indigo-100">
                                                        {userInfo.role}
                                                    </div>
                                                </div>

                                                <div className="py-2">
                                                    {['Admin', 'Expert'].includes(userInfo.role) ? (
                                                        <Link
                                                            to="/dashboard"
                                                            className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center transition-colors"
                                                            onClick={() => setIsProfileOpen(false)}
                                                        >
                                                            <LayoutDashboard size={16} className="mr-3" />
                                                            Dashboard
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setIsProfileOpen(false);
                                                                setIsRequestModalOpen(true);
                                                            }}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center transition-colors"
                                                        >
                                                            <CheckCircle size={16} className="mr-3" />
                                                            Become an Expert
                                                        </button>
                                                    )}

                                                    <Link
                                                        to="/profile"
                                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <User size={16} className="mr-3" />
                                                        Profile
                                                    </Link>
                                                </div>

                                                <div className="border-t border-gray-50 pt-2 pb-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                                    >
                                                        <LogOut size={16} className="mr-3" />
                                                        Sign out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">Log in</Link>
                                    <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-95">
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-4 md:hidden">
                            <Search className="w-5 h-5 text-gray-600" /> {/* Mobile Search Icon (Simplified) */}
                            <button
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 md:hidden shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto"
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-4 flex flex-col space-y-4">
                                {/* Mobile Filters */}
                                <div className="space-y-3 pb-4 border-b border-gray-100">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Filters</label>
                                    <select
                                        value={selectedIndustry}
                                        onChange={handleIndustryChange}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                                    >
                                        <option value="">All Industries</option>
                                        {industries.map(ind => (
                                            <option key={ind._id} value={ind._id}>{ind.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        disabled={!selectedIndustry}
                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {hasFilters && (
                                        <button
                                            onClick={handleReset}
                                            className="w-full mt-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X size={16} /> Reset Filters
                                        </button>
                                    )}
                                </div>

                                {userInfo ? (
                                    <>
                                        <div className="flex items-center space-x-3 py-2">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                                                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{userInfo.name}</p>
                                                <p className="text-xs text-gray-500">{userInfo.email}</p>
                                            </div>
                                        </div>

                                        {['Admin', 'Expert'].includes(userInfo.role) ? (
                                            <Link to="/dashboard" className="text-gray-600 font-medium py-2 flex items-center hover:text-indigo-600">
                                                <LayoutDashboard size={18} className="mr-2" />
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => setIsRequestModalOpen(true)}
                                                className="text-gray-600 font-medium py-2 flex items-center hover:text-indigo-600 w-full text-left"
                                            >
                                                <CheckCircle size={18} className="mr-2" />
                                                Become an Expert
                                            </button>
                                        )}

                                        <Link to="/profile" className="text-gray-600 font-medium py-2 flex items-center hover:text-indigo-600">
                                            <User size={18} className="mr-2" />
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="text-red-600 font-medium py-2 text-left flex items-center hover:bg-red-50"
                                        >
                                            <LogOut size={18} className="mr-2" />
                                            Sign out
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Link to="/login" className="text-center text-gray-900 font-medium py-3 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white">Log in</Link>
                                        <Link to="/signup" className="text-center bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200">
                                            Sign up for free
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            <RequestExpertModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
        </>
    );
}
