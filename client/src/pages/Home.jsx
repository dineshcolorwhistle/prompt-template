import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import Pagination from '../components/Pagination';
import { motion } from 'framer-motion';
import { listVariants, itemVariants } from '../animations';
import { Search, Sparkles, Zap, Target, ArrowRight, ChevronDown, X, Bot, Layers } from 'lucide-react';

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [selectedLLMData, setSelectedLLMData] = useState(null);

    // Filter states for the prompt listing
    const [searchTerm, setSearchTerm] = useState('');
    const debounceRef = useRef(null);
    const promptListingRef = useRef(null);

    // Get params from URL
    const page = parseInt(searchParams.get('page') || '1', 10);
    const llm = searchParams.get('llm') || '';
    const industry = searchParams.get('industry') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sort') || 'newest';

    // Determine if we should show the landing page or prompt listing
    const viewAll = searchParams.get('view') === 'all';
    const showPromptListing = viewAll || !!llm || !!industry || !!category;

    // Sync search term from URL
    useEffect(() => {
        setSearchTerm(search);
    }, [search]);

    // Fetch templates when filter is selected or view=all
    useEffect(() => {
        if (!showPromptListing) {
            setTemplates([]);
            setLoading(false);
            return;
        }

        const fetchTemplates = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    page: page.toString(),
                    limit: '12',
                    status: 'Approved'
                });

                if (llm) query.append('llm', llm);
                if (industry) query.append('industry', industry);
                if (category) query.append('category', category);
                if (search) query.append('search', search);
                if (sortBy) query.append('sort', sortBy);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates?${query.toString()}`);

                if (response.ok) {
                    const data = await response.json();
                    if (data.result) {
                        setTemplates(data.result);
                        setTotalPages(data.pages);
                        setTotalItems(data.total);
                    } else {
                        setTemplates(Array.isArray(data) ? data : []);
                        setTotalPages(1);
                        setTotalItems(Array.isArray(data) ? data.length : 0);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch templates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [page, llm, industry, category, search, sortBy, showPromptListing]);

    // Fetch LLM info when selected
    useEffect(() => {
        const fetchLLMInfo = async () => {
            if (!llm) {
                setSelectedLLMData(null);
                return;
            }
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/llms/${llm}`);
                if (response.ok) {
                    const data = await response.json();
                    setSelectedLLMData(data);
                }
            } catch (error) {
                console.error('Failed to fetch LLM info:', error);
            }
        };
        fetchLLMInfo();
    }, [llm]);

    // Scroll to prompt listing when it becomes visible
    useEffect(() => {
        if (showPromptListing && promptListingRef.current) {
            setTimeout(() => {
                promptListingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [showPromptListing, llm]);

    const handlePageChange = (newPage) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
        if (promptListingRef.current) {
            promptListingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (value.trim()) {
                params.set('search', value.trim());
            } else {
                params.delete('search');
            }
            params.delete('page');
            navigate(`/?${params.toString()}`, { replace: true });
        }, 400);
    };

    const handleSortChange = (e) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams);
        if (val && val !== 'newest') {
            params.set('sort', val);
        } else {
            params.delete('sort');
        }
        params.delete('page');
        navigate(`/?${params.toString()}`);
    };

    const clearFilters = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSearchTerm('');
        navigate(`/?view=all`);
    };

    const hasActiveFilters = industry || category || search;

    // Featured Prompts data
    const featuredPrompts = [
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: "Content Creation",
            description: "Generate compelling blog posts, social media captions, and marketing copy with AI-powered templates crafted by industry experts.",
            gradient: "from-amber-500 to-orange-600",
            bgGradient: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Code Generation",
            description: "Accelerate development with battle-tested coding prompts for debugging, refactoring, and building complex applications.",
            gradient: "from-blue-500 to-cyan-600",
            bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Business Strategy",
            description: "Unlock insights for market analysis, competitive research, and strategic planning using professionally curated prompts.",
            gradient: "from-emerald-500 to-teal-600",
            bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
            {/* ========== LANDING PAGE SECTIONS ========== */}
            {!showPromptListing && (
                <>
                    {/* Hero Banner */}
                    <section className="relative overflow-hidden bg-indigo-950">
                        {/* Light mode gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 transition-opacity duration-300 ease-in-out opacity-100 dark:opacity-0"></div>
                        {/* Dark mode gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 transition-opacity duration-300 ease-in-out opacity-0 dark:opacity-100"></div>

                        {/* Background decorative elements */}
                        <div className="absolute inset-0">
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
                            {/* Subtle grid pattern */}
                            <div className="absolute inset-0 opacity-[0.02]" style={{
                                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                backgroundSize: '40px 40px'
                            }}></div>
                        </div>

                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
                            <div className="text-center max-w-4xl mx-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/10">
                                        <Sparkles size={14} className="text-amber-300" />
                                        <span>AI-Powered Prompt Templates</span>
                                    </div>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
                                >
                                    Discover & Use the Best
                                    <span className="block mt-2 bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                                        AI Prompt Templates
                                    </span>
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="text-lg sm:text-xl text-indigo-100/80 max-w-2xl mx-auto mb-10 leading-relaxed"
                                >
                                    Browse expert-crafted prompts for every LLM. Boost your productivity with templates designed for content creation, coding, business strategy, and more.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                                >
                                    <a
                                        href="#about"
                                        className="group px-8 py-3.5 bg-white text-indigo-700 font-bold rounded-xl shadow-xl shadow-indigo-900/30 hover:shadow-indigo-900/50 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
                                    >
                                        Get Started
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </a>
                                    <a
                                        href="#featured"
                                        className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 text-sm sm:text-base"
                                    >
                                        Explore Prompts
                                    </a>
                                </motion.div>

                                {/* Stats */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.5 }}
                                    className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto"
                                >
                                    {[
                                        { label: 'Templates', value: '500+' },
                                        { label: 'LLMs', value: '10+' },
                                        { label: 'Industries', value: '20+' },
                                    ].map((stat, i) => (
                                        <div key={i} className="text-center">
                                            <p className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</p>
                                            <p className="text-sm text-indigo-200/70 mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>

                        {/* Bottom wave transition */}
                        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
                            <svg viewBox="0 0 1440 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block relative" preserveAspectRatio="none" style={{ height: '120px' }}>
                                {/* Shadow wave for depth */}
                                <path d="M0 151V90C160 120 320 50 520 70C720 90 920 130 1120 80C1220 55 1340 40 1440 50V151H0Z" className="fill-black/10 dark:fill-black/30 transition-colors duration-300" />
                                {/* Main solid wave */}
                                <path d="M0 151V110C200 70 400 120 720 90C1040 60 1280 100 1440 80V151H0Z" className="fill-gray-50 dark:fill-gray-950 transition-colors duration-300" />
                            </svg>
                        </div>
                    </section>

                    {/* About Section */}
                    <section id="about" className="py-20 sm:py-28">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                                className="text-center max-w-3xl mx-auto mb-16"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-4">
                                    About the Product
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                                    Your Ultimate{' '}
                                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Prompt Library
                                    </span>
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                    PromptMarket is the premier marketplace for AI prompt templates. We curate expert-crafted prompts across every major LLM — from ChatGPT to Claude, Gemini, and more. Whether you're a developer, marketer, or entrepreneur, find the perfect prompt to supercharge your workflow and unlock the full potential of AI.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        icon: <Layers className="w-6 h-6" />,
                                        title: "Multi-LLM Support",
                                        description: "Prompts tailored for every major AI model. Select your preferred LLM and get perfectly optimized templates.",
                                        iconClass: "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30"
                                    },
                                    {
                                        icon: <Target className="w-6 h-6" />,
                                        title: "Industry Focused",
                                        description: "Organized by industry and category. Quickly find prompts relevant to your specific domain and use case.",
                                        iconClass: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30"
                                    },
                                    {
                                        icon: <Sparkles className="w-6 h-6" />,
                                        title: "Expert Curated",
                                        description: "Every prompt is crafted and verified by domain experts. Rate, review, and save your favorites to build your library.",
                                        iconClass: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30"
                                    }
                                ].map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                        className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl hover:shadow-indigo-50 dark:hover:shadow-indigo-900/10 transition-all duration-300"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 ${feature.iconClass}`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Featured Prompts */}
                    <section id="featured" className="py-20 sm:py-28 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 transition-colors duration-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                                className="text-center max-w-3xl mx-auto mb-16"
                            >
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 text-xs font-semibold tracking-wider uppercase mb-4">
                                    Featured Use Cases
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                                    Prompts for Every{' '}
                                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        Use Case
                                    </span>
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Explore our most popular prompt categories and start generating amazing results today.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {featuredPrompts.map((prompt, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.5, delay: i * 0.15 }}
                                        className={`group relative bg-gradient-to-br ${prompt.bgGradient} rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden`}
                                    >
                                        {/* Decorative corner glow */}
                                        <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${prompt.gradient} rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-300`}></div>

                                        <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${prompt.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            {prompt.icon}
                                        </div>
                                        <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-3">{prompt.title}</h3>
                                        <p className="relative text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{prompt.description}</p>
                                        <div className="relative flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-3 gap-2 transition-all duration-200">
                                            Explore Templates
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* ========== PROMPT LISTING (When LLM is selected) ========== */}
            {showPromptListing && (
                <div ref={promptListingRef} className="pt-6 pb-16">
                    {/* Professional Filter & Search Bar */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                            {/* Top Row: Title + Result Count + Sort */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3">
                                    {selectedLLMData?.icon && (
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={selectedLLMData.icon.startsWith('http') ? selectedLLMData.icon : `${import.meta.env.VITE_API_URL}/${selectedLLMData.icon.replace(/\\/g, '/')}`}
                                                alt={selectedLLMData.name}
                                                className="w-5 h-5 object-contain"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {selectedLLMData ? selectedLLMData.name : 'All'} Prompts
                                    </h2>
                                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                                        {totalItems} result{totalItems !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={handleSortChange}
                                            className="appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                            <option value="rating">Top Rated</option>
                                            <option value="title">A – Z</option>
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                    </div>

                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            <X size={12} />
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Row: Search + Filters */}
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center px-5 py-4">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search prompts by name or keyword..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Template Grid */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading templates...</p>
                            </div>
                        ) : templates.length > 0 ? (
                            <>
                                <motion.div
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                                    variants={listVariants}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {templates.map(template => (
                                        <motion.div key={template._id} variants={itemVariants} className="h-full">
                                            <TemplateCard template={template} />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                <div className="mt-12">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        totalItems={totalItems}
                                        itemsPerPage={12}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No templates found</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    We couldn't find any templates matching your criteria. Try adjusting your filters or search term.
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30"
                                    >
                                        Clear all filters
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
