import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import Pagination from '../components/Pagination';
import { motion } from 'framer-motion';
import { listVariants, itemVariants } from '../animations';
import { Search, Sparkles, Zap, Target, ArrowRight, ChevronDown, X, Bot, Layers, Code, Briefcase, FileText, Star } from 'lucide-react';

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
        <div className="min-h-screen bg-white dark:bg-[#0b0f19] transition-colors duration-200">
                        {/* ========== LANDING PAGE SECTIONS ========== */}
            {!showPromptListing && (
                <>
                    {/* Hero Banner */}
                    <section className="relative px-4 pt-20 pb-20 sm:pt-32 sm:pb-24 overflow-hidden bg-white dark:bg-[#0b0f19] transition-colors duration-200">
                        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
                            {/* Pill */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fdf2f6] dark:bg-[#fdf2f6]/10 text-[#ea2e6d] text-sm font-semibold mb-8 border border-[#ea2e6d]/10">
                                    <Sparkles size={16} fill="currentColor" />
                                    <span>AI-Powered Prompt Templates</span>
                                </div>
                            </motion.div>
                            
                            {/* Headline */}
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#111827] dark:text-white leading-[1.15] mb-6 tracking-tight"
                            >
                                Discover & Use the Best<br/>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0e1c81] to-[#ea2e6d]">AI Prompt Templates</span>
                            </motion.h1>
                            
                            {/* Typing Effect */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-lg sm:text-lg text-gray-500 dark:text-gray-400 mb-10 flex items-center justify-center gap-2 font-medium"
                            >
                                <span className="text-[#ea2e6d] font-bold">&gt;</span>
                                <span>Draft a cold outreach email for B2B SaaS...</span>
                                <span className="animate-pulse w-0.5 h-6 bg-[#ea2e6d]"></span>
                            </motion.div>
                            
                            {/* Buttons */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <a href="#about" className="px-8 py-3.5 bg-[#ea2e6d] text-white font-bold rounded-full hover:bg-[#d42560] transition-all flex items-center gap-2 text-sm sm:text-base shadow-lg shadow-[#ea2e6d]/20 hover:shadow-[#ea2e6d]/40">
                                    Get Started <ArrowRight size={18} />
                                </a>
                                <Link to="/?view=all" className="px-8 py-3.5 bg-transparent border-2 border-gray-100 dark:border-[#1a1f33] text-gray-900 dark:text-white font-bold rounded-full hover:bg-[#0e1c81] hover:border-[#0e1c81] hover:text-white transition-all text-sm sm:text-base">
                                    Explore Prompts
                                </Link>
                            </motion.div>
                            
                            {/* Stats */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                className="mt-20 flex justify-center gap-12 sm:gap-24"
                            >
                                <div className="text-center">
                                    <p className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#0e1c81] to-[#ea2e6d]">500+</p>
                                    <p className="text-[11px] sm:text-xs text-gray-400 border-gray-200 dark:text-gray-500 mt-2 font-bold uppercase tracking-[0.2em]">Templates</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#0e1c81] to-[#ea2e6d]">10+</p>
                                    <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-2 font-bold uppercase tracking-[0.2em]">LLMs</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#0e1c81] to-[#ea2e6d]">20+</p>
                                    <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-2 font-bold uppercase tracking-[0.2em]">Industries</p>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* See It In Action */}
                    <section className="py-24 bg-white dark:bg-[#0b0f19] transition-colors duration-200">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mb-16"
                            >
                                <p className="text-[#ea2e6d] text-[11px] font-bold tracking-[0.15em] uppercase mb-4">See It In Action</p>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                                    From Prompt to Perfection
                                </h2>
                            </motion.div>
                            
                            <div className="space-y-6 text-left relative z-10 w-full max-w-[800px] mx-auto">
                                {/* Terminal Window 1 */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-[#f9fafb] dark:bg-[#11131e] rounded-xl border border-gray-100 dark:border-[#1a1f33] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden"
                                >
                                    <div className="flex items-center px-4 py-3 bg-[#f3f4f6] dark:bg-[#151825] border-b border-gray-200 dark:border-[#1e2336] rounded-t-xl">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                                        </div>
                                        <div className="mx-auto text-[11px] text-gray-400 dark:text-gray-500 font-medium font-mono">prompt-terminal</div>
                                    </div>
                                    <div className="p-6 sm:p-8 text-sm">
                                        <div className="flex text-[#ea2e6d] mb-4 font-mono">
                                            <span className="mr-3 font-bold">&gt;</span>
                                            <span className="text-gray-600 dark:text-[#a0a8be]">Write a product launch email for a SaaS tool</span>
                                        </div>
                                        <div className="text-gray-500 dark:text-[#8890a8] leading-relaxed sm:pl-5 border-l-2 border-gray-100 dark:border-[#1e2336] pl-4 py-1">
                                            Subject: Introducing [Product] — The smartest way to [solve problem].<br/><br/>
                                            Dear [Name],<br/>
                                            We're thrilled to announce...
                                        </div>
                                    </div>
                                </motion.div>
                                
                                {/* Terminal Window 2 */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-[#f9fafb] dark:bg-[#11131e] rounded-xl border border-gray-100 dark:border-[#1a1f33] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden"
                                >
                                    <div className="flex items-center px-4 py-3 bg-[#f3f4f6] dark:bg-[#151825] border-b border-gray-200 dark:border-[#1e2336] rounded-t-xl">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                                        </div>
                                        <div className="mx-auto text-[11px] text-gray-400 dark:text-gray-500 font-medium font-mono">prompt-terminal</div>
                                    </div>
                                    <div className="p-6 sm:p-8 text-sm">
                                        <div className="flex text-[#ea2e6d] mb-4 font-mono">
                                            <span className="mr-3 font-bold">&gt;</span>
                                            <span className="text-gray-600 dark:text-[#a0a8be]">Debug this React component's infinite re-render</span>
                                        </div>
                                        <div className="text-gray-500 dark:text-[#8890a8] leading-relaxed sm:pl-5 border-l-2 border-gray-100 dark:border-[#1e2336] pl-4 py-1">
                                            The issue is a missing dependency in useEffect. Add the state variable to the dependency array or use useCallback...
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* About Section */}
                    <section id="about" className="py-24 bg-white dark:bg-[#0b0f19] transition-colors duration-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                {/* Left side text */}
                                <motion.div 
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                >
                                    <p className="text-[#ea2e6d] text-[11px] font-bold tracking-[0.15em] uppercase mb-4">About The Product</p>
                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-white mb-6 leading-tight">
                                        Your Ultimate Prompt Library
                                    </h2>
                                    <p className="text-lg text-gray-500 dark:text-[#a0a8be] leading-relaxed">
                                        PromptMarket is the premier marketplace for AI prompt templates. We curate expert-crafted prompts across every major LLM — from ChatGPT to Claude, Gemini, and more. Whether you're a developer, marketer, or entrepreneur, find the perfect prompt to supercharge your workflow.
                                    </p>
                                </motion.div>
                                
                                {/* Right side cards */}
                                <div className="space-y-4">
                                    {[
                                        {
                                            icon: <Bot size={20} />,
                                            title: "Multi-LLM Support",
                                            description: "Prompts tailored for every major AI model. Select your preferred LLM and get perfectly optimized templates."
                                        },
                                        {
                                            icon: <Target size={20} />,
                                            title: "Industry Focused",
                                            description: "Organized by industry and category. Quickly find prompts relevant to your specific domain and use case."
                                        },
                                        {
                                            icon: <Star size={20} />,
                                            title: "Expert Curated",
                                            description: "Every prompt is crafted and verified by domain experts. Rate, review, and save your favorites."
                                        }
                                    ].map((feature, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: 30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="relative group rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-[#11131e] p-6 flex gap-5 items-start z-0"
                                        >
                                            <div 
                                                className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-[#0e1c81]/30 to-[#ea2e6d]/30 group-hover:from-[#0e1c81] group-hover:to-[#ea2e6d] transition-all duration-300 pointer-events-none -z-10"
                                                style={{
                                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                                    WebkitMaskComposite: 'xor',
                                                    maskComposite: 'exclude'
                                                }}
                                            ></div>
                                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#fdf2f6] dark:bg-[#ea2e6d]/10 flex items-center justify-center text-[#ea2e6d]">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                                                <p className="text-sm text-gray-500 dark:text-[#8890a8] leading-relaxed">{feature.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Featured Use Cases */}
                    <section id="featured" className="py-24 bg-white dark:bg-[#0b0f19] transition-colors duration-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center max-w-3xl mx-auto mb-16"
                            >
                                <p className="text-[#ea2e6d] text-[11px] font-bold tracking-[0.15em] uppercase mb-4">Featured Use Cases</p>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-white mb-6">
                                    Prompts for Every Use Case
                                </h2>
                                <p className="text-lg text-gray-500 dark:text-[#a0a8be] leading-relaxed">
                                    Explore our most popular prompt categories and start generating amazing results today.
                                </p>
                            </motion.div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        icon: <FileText size={22} />,
                                        title: "Content Creation",
                                        description: "Generate compelling blog posts, social media captions, and marketing copy with AI-powered templates."
                                    },
                                    {
                                        icon: <Code size={22} />,
                                        title: "Code Generation",
                                        description: "Accelerate development with battle-tested coding prompts for debugging, refactoring, and building."
                                    },
                                    {
                                        icon: <Briefcase size={22} />,
                                        title: "Business Strategy",
                                        description: "Unlock insights for market analysis, competitive research, and strategic planning."
                                    }
                                ].map((card, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white dark:bg-[#11131e] p-8 rounded-3xl border border-gray-100 dark:border-[#1a1f33] shadow-sm flex flex-col items-start transition-all duration-300 group hover:border-[#ea2e6d] hover:shadow-[0_8px_30px_rgba(234,46,109,0.15)]"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-[#fdf2f6] dark:bg-[#ea2e6d]/10 flex items-center justify-center text-[#ea2e6d] mb-6">
                                            {card.icon}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{card.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-[#8890a8] leading-relaxed mb-8 flex-grow">
                                            {card.description}
                                        </p>
                                        <Link to="/?view=all" className="text-[#ea2e6d] text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                            Explore Templates <ArrowRight size={16} />
                                        </Link>
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
