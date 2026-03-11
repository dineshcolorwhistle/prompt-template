import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dropdownVariants } from '../animations';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown, CheckCircle, BadgeCheck, Bot, Bookmark, Sun, Moon, Target, Layers, Filter } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import RequestExpertModal from './RequestExpertModal';
import useDarkMode from '../hooks/useDarkMode';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLLMDropdownOpen, setIsLLMDropdownOpen] = useState(false);
    const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const { userInfo, logout } = useAuth();
    const [theme, setTheme] = useDarkMode();
    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
    const profileRef = useRef(null);
    const llmDropdownRef = useRef(null);
    const industryDropdownRef = useRef(null);
    const categoryDropdownRef = useRef(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Filter State
    const [llms, setLLMs] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [categories, setCategories] = useState([]);

    const selectedLLM = searchParams.get('llm') || '';
    const selectedIndustry = searchParams.get('industry') || '';
    const selectedCategory = searchParams.get('category') || '';

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [llmRes, indRes, catRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/llms?limit=100&status=active`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/industries?limit=100&status=active`),
                    fetch(`${import.meta.env.VITE_API_URL}/api/categories?limit=100&status=active`)
                ]);

                if (llmRes.ok) {
                    const data = await llmRes.json();
                    setLLMs(data.result || []);
                }
                if (indRes.ok) {
                    const data = await indRes.json();
                    setIndustries(data.result || []);
                }
                if (catRes.ok) {
                    const data = await catRes.json();
                    setCategories(data.result || []);
                }
            } catch (error) {
                console.error('Failed to fetch navbar filter data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
            if (llmDropdownRef.current && !llmDropdownRef.current.contains(event.target)) setIsLLMDropdownOpen(false);
            if (industryDropdownRef.current && !industryDropdownRef.current.contains(event.target)) setIsIndustryDropdownOpen(false);
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) setIsCategoryDropdownOpen(false);
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

    const handleLLMSelect = (llmId) => {
        const params = new URLSearchParams(searchParams);
        if (llmId) {
            params.set('llm', llmId);
            params.delete('view');
        } else {
            params.delete('llm');
            params.set('view', 'all');
        }
        navigate(`/?${params.toString()}`);
        setIsLLMDropdownOpen(false);
        setIsMenuOpen(false);
    };

    const handleIndustrySelect = (indId) => {
        const params = new URLSearchParams(searchParams);
        if (indId) {
            params.set('industry', indId);
            params.delete('view');
        } else {
            params.delete('industry');
            params.set('view', 'all');
        }
        navigate(`/?${params.toString()}`);
        setIsIndustryDropdownOpen(false);
        setIsMenuOpen(false);
    };

    const handleCategorySelect = (catId) => {
        const params = new URLSearchParams(searchParams);
        if (catId) {
            params.set('category', catId);
            params.delete('view');
        } else {
            params.delete('category');
            params.set('view', 'all');
        }
        navigate(`/?${params.toString()}`);
        setIsCategoryDropdownOpen(false);
        setIsMenuOpen(false);
    };

    const getSelectedLLMName = () => {
        if (!selectedLLM) return 'LLM';
        const found = llms.find(l => l._id === selectedLLM);
        return found ? found.name : 'LLM';
    };

    const getSelectedIndustryName = () => {
        if (!selectedIndustry) return 'Industry';
        const found = industries.find(i => i._id === selectedIndustry);
        return found ? found.name : 'Industry';
    };

    const getSelectedCategoryName = () => {
        if (!selectedCategory) return 'Category';
        const found = categories.find(c => c._id === selectedCategory);
        return found ? found.name : 'Category';
    };

    const getSelectedLLMIcon = () => {
        if (!selectedLLM) return null;
        const found = llms.find(l => l._id === selectedLLM);
        return found?.icon || null;
    };

    const renderFilterDropdown = (
        isOpen, setIsOpen, dropdownRef,
        selectedValue, items, title,
        handleSelect, getSelectedName,
        getIconComponent, allLabel
    ) => (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${selectedValue
                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
            >
                {getIconComponent ? getIconComponent() : <Target size={16} />}
                <span className="max-w-[100px] truncate">{getSelectedName()}</span>
                <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 origin-top-right z-50 overflow-hidden"
                    >
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{title}</p>
                        </div>
                        <div className="max-h-72 overflow-y-auto scrollbar-thin py-1">
                            <button
                                onClick={() => handleSelect('')}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${!selectedValue
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <Bot size={14} className="text-gray-500 dark:text-gray-400 opacity-0" />
                                    <span className="absolute text-[10px] font-bold text-gray-500">ALL</span>
                                </div>
                                <span>{allLabel}</span>
                                {!selectedValue && (
                                    <div className="ml-auto w-2 h-2 bg-indigo-500 rounded-full"></div>
                                )}
                            </button>
                            {items.map(item => (
                                <button
                                    key={item._id}
                                    onClick={() => handleSelect(item._id)}
                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${selectedValue === item._id
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {item.icon ? (
                                            <img
                                                src={item.icon.startsWith('http') ? item.icon : `${import.meta.env.VITE_API_URL}/${item.icon.replace(/\\/g, '/')}`}
                                                alt={item.name}
                                                className="w-5 h-5 object-contain"
                                                onError={(e) => { e.target.parentElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`; }}
                                            />
                                        ) : (
                                            title.includes('LLM') ? <Bot size={14} className="text-gray-400 dark:text-gray-500" /> :
                                                title.includes('Industry') ? <Target size={14} className="text-gray-400 dark:text-gray-500" /> :
                                                    <Layers size={14} className="text-gray-400 dark:text-gray-500" />
                                        )}
                                    </div>
                                    <span className="truncate">{item.name}</span>
                                    {selectedValue === item._id && (
                                        <div className="ml-auto w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-[#1a1f33]/50 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full">
                        {/* Left Section: Logo + Product Name */}
                        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group hover:opacity-90 transition-opacity">
                            <img src="/pm-logo.png" alt="PromptMarket Logo" className="h-10 sm:h-16 w-auto object-contain dark:hidden" />
                            <img src="/pm-white-logo.png" alt="PromptMarket Logo" className="h-10 sm:h-16 w-auto object-contain hidden dark:block" />
                        </Link>

                        {/* Right Section: Dropdowns + Theme Toggle + User */}
                        <div className="hidden lg:flex items-center gap-2">
                            {/* Filter Dropdowns */}
                            {renderFilterDropdown(
                                isLLMDropdownOpen, setIsLLMDropdownOpen, llmDropdownRef,
                                selectedLLM, llms, 'Choose an LLM', handleLLMSelect,
                                getSelectedLLMName,
                                () => getSelectedLLMIcon() ? (
                                    <img src={getSelectedLLMIcon().startsWith('http') ? getSelectedLLMIcon() : `${import.meta.env.VITE_API_URL}/${getSelectedLLMIcon().replace(/\\/g, '/')}`} alt="" className="w-5 h-5 object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
                                ) : <Bot size={16} />,
                                'All LLMs'
                            )}
                            {renderFilterDropdown(
                                isIndustryDropdownOpen, setIsIndustryDropdownOpen, industryDropdownRef,
                                selectedIndustry, industries, 'Choose an Industry', handleIndustrySelect,
                                getSelectedIndustryName,
                                () => <Target size={16} />,
                                'All Industries'
                            )}
                            {renderFilterDropdown(
                                isCategoryDropdownOpen, setIsCategoryDropdownOpen, categoryDropdownRef,
                                selectedCategory, categories, 'Choose a Category', handleCategorySelect,
                                getSelectedCategoryName,
                                () => <Layers size={16} />,
                                'All Categories'
                            )}

                            {/* Divider */}
                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                                aria-label="Toggle theme"
                            >
                                <div className="relative w-5 h-5">
                                    <Sun
                                        size={20}
                                        className={`absolute inset-0 transform transition-all duration-300 ${theme === 'dark'
                                            ? 'rotate-0 scale-100 opacity-100'
                                            : 'rotate-90 scale-0 opacity-0'
                                            }`}
                                    />
                                    <Moon
                                        size={20}
                                        className={`absolute inset-0 transform transition-all duration-300 ${theme === 'dark'
                                            ? '-rotate-90 scale-0 opacity-0'
                                            : 'rotate-0 scale-100 opacity-100'
                                            }`}
                                    />
                                </div>
                            </button>

                            {/* User Account Section */}
                            {userInfo ? (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm relative">
                                            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={14} />}
                                            {userInfo.isVerifiedExpert && (
                                                <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-900 rounded-full p-0.5">
                                                    <BadgeCheck size={10} className="text-blue-500 fill-blue-50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="hidden lg:block text-left">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white max-w-[100px] truncate leading-tight">{userInfo.name}</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize leading-tight">{userInfo.role}</p>
                                        </div>
                                        <ChevronDown size={14} className={`text-gray-400 transform transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                variants={dropdownVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 origin-top-right z-50"
                                            >
                                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={16} />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{userInfo.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userInfo.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`mt-2 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize gap-1 ${userInfo.role === 'Expert' && userInfo.isVerifiedExpert
                                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                        : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'}`}>
                                                        {userInfo.role === 'Expert'
                                                            ? (userInfo.isVerifiedExpert
                                                                ? <><BadgeCheck size={12} className="text-blue-600 dark:text-blue-400" /> Verified Expert</>
                                                                : 'Expert (Provisional)')
                                                            : userInfo.role}
                                                    </div>
                                                </div>

                                                <div className="py-1">
                                                    {['Admin', 'Expert'].includes(userInfo.role) ? (
                                                        <Link
                                                            to="/dashboard"
                                                            className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-3 transition-colors"
                                                            onClick={() => setIsProfileOpen(false)}
                                                        >
                                                            <LayoutDashboard size={16} />
                                                            Dashboard
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setIsProfileOpen(false);
                                                                setIsRequestModalOpen(true);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-3 transition-colors"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Become an Expert
                                                        </button>
                                                    )}

                                                    <Link
                                                        to="/my-library"
                                                        className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-3 transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <Bookmark size={16} />
                                                        My Library
                                                    </Link>

                                                </div>

                                                <div className="border-t border-gray-100 dark:border-gray-800 pt-1 pb-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                                                    >
                                                        <LogOut size={16} />
                                                        Sign out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-white font-medium text-sm px-4 py-2 rounded-xl hover:bg-[#0e1c81] transition-all duration-200">
                                        Log in
                                    </Link>
                                    <Link to="/signup" className="bg-[#ea2e6d] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#d42560] transition-all duration-200 shadow-lg shadow-[#ea2e6d]/20 hover:shadow-[#ea2e6d]/40 transform active:scale-95">
                                        Sign up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile: Theme + Menu Button */}
                        <div className="flex items-center gap-1 md:hidden">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button
                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
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
                            className="absolute top-20 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden shadow-xl overflow-hidden max-h-[85vh] overflow-y-auto z-50"
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-4 flex flex-col space-y-4">
                                {/* Mobile Filter Selection */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Select LLM</label>
                                        <div className="relative">
                                            <Bot className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            <select
                                                value={selectedLLM}
                                                onChange={(e) => handleLLMSelect(e.target.value)}
                                                className="w-full appearance-none pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300 font-medium"
                                            >
                                                <option value="">All LLMs</option>
                                                {llms.map(llm => (
                                                    <option key={llm._id} value={llm._id}>{llm.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Select Industry</label>
                                        <div className="relative">
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            <select
                                                value={selectedIndustry}
                                                onChange={(e) => handleIndustrySelect(e.target.value)}
                                                className="w-full appearance-none pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300 font-medium"
                                            >
                                                <option value="">All Industries</option>
                                                {industries.map(i => (
                                                    <option key={i._id} value={i._id}>{i.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Select Category</label>
                                        <div className="relative">
                                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => handleCategorySelect(e.target.value)}
                                                className="w-full appearance-none pl-9 pr-9 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300 font-medium"
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800"></div>

                                {userInfo ? (
                                    <>
                                        <div className="flex items-center gap-3 py-2">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{userInfo.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{userInfo.email}</p>
                                            </div>
                                        </div>

                                        {['Admin', 'Expert'].includes(userInfo.role) ? (
                                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-gray-600 dark:text-gray-300 font-medium py-2.5 flex items-center gap-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                <LayoutDashboard size={18} />
                                                Dashboard
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => { setIsMenuOpen(false); setIsRequestModalOpen(true); }}
                                                className="text-gray-600 dark:text-gray-300 font-medium py-2.5 flex items-center gap-3 hover:text-indigo-600 dark:hover:text-indigo-400 w-full text-left transition-colors"
                                            >
                                                <CheckCircle size={18} />
                                                Become an Expert
                                            </button>
                                        )}

                                        <Link to="/my-library" onClick={() => setIsMenuOpen(false)} className="text-gray-600 dark:text-gray-300 font-medium py-2.5 flex items-center gap-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            <Bookmark size={18} />
                                            My Library
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="text-red-600 dark:text-red-400 font-medium py-2.5 text-left flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl px-2 -mx-2 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Sign out
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center text-gray-900 dark:text-white font-medium py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-[#0e1c81] hover:border-[#0e1c81] hover:text-white transition-colors">
                                            Log in
                                        </Link>
                                        <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="text-center bg-[#ea2e6d] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#ea2e6d]/20 hover:shadow-[#ea2e6d]/40 transition-shadow">
                                            Sign up
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
