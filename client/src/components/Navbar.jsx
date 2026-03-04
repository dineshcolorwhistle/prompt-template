import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { dropdownVariants } from '../animations';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown, CheckCircle, BadgeCheck, Bot, Bookmark, Sun, Moon } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import RequestExpertModal from './RequestExpertModal';
import useDarkMode from '../hooks/useDarkMode';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLLMDropdownOpen, setIsLLMDropdownOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const { userInfo, logout } = useAuth();
    const [theme, setTheme] = useDarkMode();
    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
    const profileRef = useRef(null);
    const llmDropdownRef = useRef(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // LLM State
    const [llms, setLLMs] = useState([]);
    const selectedLLM = searchParams.get('llm') || '';

    // Fetch LLMs on mount
    useEffect(() => {
        const fetchLLMs = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/llms?limit=100&status=active`);
                const data = await response.json();
                if (response.ok && data.result) {
                    setLLMs(data.result);
                }
            } catch (error) {
                console.error('Failed to fetch LLMs:', error);
            }
        };
        fetchLLMs();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (llmDropdownRef.current && !llmDropdownRef.current.contains(event.target)) {
                setIsLLMDropdownOpen(false);
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

    const handleLLMSelect = (llmId) => {
        const params = new URLSearchParams();
        if (llmId) {
            params.set('llm', llmId);
        }
        navigate(`/?${params.toString()}`);
        setIsLLMDropdownOpen(false);
        setIsMenuOpen(false);
    };

    const getSelectedLLMName = () => {
        if (!selectedLLM) return 'Select LLM';
        const found = llms.find(l => l._id === selectedLLM);
        return found ? found.name : 'Select LLM';
    };

    const getSelectedLLMIcon = () => {
        if (!selectedLLM) return null;
        const found = llms.find(l => l._id === selectedLLM);
        return found?.icon || null;
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full">
                        {/* Left Section: Logo + Product Name */}
                        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
                            <div className="relative">
                                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 group-hover:shadow-indigo-300 dark:group-hover:shadow-indigo-800/40 transition-all duration-300 group-hover:scale-105">
                                    P
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent hidden sm:block">
                                PromptMarket
                            </span>
                        </Link>

                        {/* Right Section: LLM Dropdown + Theme Toggle + User */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* LLM Dropdown */}
                            <div className="relative" ref={llmDropdownRef}>
                                <button
                                    onClick={() => setIsLLMDropdownOpen(!isLLMDropdownOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 ${
                                        selectedLLM
                                            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 shadow-sm'
                                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {getSelectedLLMIcon() ? (
                                        <img
                                            src={getSelectedLLMIcon().startsWith('http') ? getSelectedLLMIcon() : `${import.meta.env.VITE_API_URL}/${getSelectedLLMIcon().replace(/\\/g, '/')}`}
                                            alt=""
                                            className="w-5 h-5 object-contain rounded"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <Bot size={16} />
                                    )}
                                    <span className="max-w-[120px] truncate">{getSelectedLLMName()}</span>
                                    <ChevronDown size={14} className={`transform transition-transform duration-200 ${isLLMDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isLLMDropdownOpen && (
                                        <motion.div
                                            variants={dropdownVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 origin-top-right z-50 overflow-hidden"
                                        >
                                            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Choose an LLM</p>
                                            </div>
                                            <div className="max-h-72 overflow-y-auto scrollbar-thin py-1">
                                                <button
                                                    onClick={() => handleLLMSelect('')}
                                                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                        !selectedLLM
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                        <Bot size={14} className="text-gray-500 dark:text-gray-400" />
                                                    </div>
                                                    <span>All LLMs</span>
                                                    {!selectedLLM && (
                                                        <div className="ml-auto w-2 h-2 bg-indigo-500 rounded-full"></div>
                                                    )}
                                                </button>
                                                {llms.map(llm => (
                                                    <button
                                                        key={llm._id}
                                                        onClick={() => handleLLMSelect(llm._id)}
                                                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                                                            selectedLLM === llm._id
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {llm.icon ? (
                                                                <img
                                                                    src={llm.icon.startsWith('http') ? llm.icon : `${import.meta.env.VITE_API_URL}/${llm.icon.replace(/\\/g, '/')}`}
                                                                    alt={llm.name}
                                                                    className="w-5 h-5 object-contain"
                                                                    onError={(e) => { e.target.parentElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`; }}
                                                                />
                                                            ) : (
                                                                <Bot size={14} className="text-gray-400 dark:text-gray-500" />
                                                            )}
                                                        </div>
                                                        <span className="truncate">{llm.name}</span>
                                                        {selectedLLM === llm._id && (
                                                            <div className="ml-auto w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

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
                                        className={`absolute inset-0 transform transition-all duration-300 ${
                                            theme === 'dark'
                                                ? 'rotate-0 scale-100 opacity-100'
                                                : 'rotate-90 scale-0 opacity-0'
                                        }`}
                                    />
                                    <Moon
                                        size={20}
                                        className={`absolute inset-0 transform transition-all duration-300 ${
                                            theme === 'dark'
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

                                                    <Link
                                                        to="/profile"
                                                        className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-3 transition-colors"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <User size={16} />
                                                        Profile
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
                                    <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                                        Log in
                                    </Link>
                                    <Link to="/signup" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30 hover:shadow-indigo-300/50 transform active:scale-95">
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
                            className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 md:hidden shadow-xl overflow-hidden max-h-[85vh] overflow-y-auto z-50"
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-4 flex flex-col space-y-4">
                                {/* Mobile LLM Selection */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Select LLM</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleLLMSelect('')}
                                            className={`px-3 py-2.5 text-sm rounded-xl border font-medium transition-all flex items-center gap-2 ${
                                                !selectedLLM
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                        >
                                            <Bot size={14} />
                                            All LLMs
                                        </button>
                                        {llms.map(llm => (
                                            <button
                                                key={llm._id}
                                                onClick={() => handleLLMSelect(llm._id)}
                                                className={`px-3 py-2.5 text-sm rounded-xl border font-medium transition-all flex items-center gap-2 truncate ${
                                                    selectedLLM === llm._id
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                {llm.icon ? (
                                                    <img
                                                        src={llm.icon.startsWith('http') ? llm.icon : `${import.meta.env.VITE_API_URL}/${llm.icon.replace(/\\/g, '/')}`}
                                                        alt=""
                                                        className="w-4 h-4 object-contain rounded flex-shrink-0"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <Bot size={14} className="flex-shrink-0" />
                                                )}
                                                <span className="truncate">{llm.name}</span>
                                            </button>
                                        ))}
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
                                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-gray-600 dark:text-gray-300 font-medium py-2.5 flex items-center gap-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            <User size={18} />
                                            Profile
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
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center text-gray-900 dark:text-white font-medium py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-900 transition-colors">
                                            Log in
                                        </Link>
                                        <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30">
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
