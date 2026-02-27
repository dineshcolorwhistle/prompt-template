import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bookmark, Star, Copy, ArrowRight, Bot, Clock,
    Sparkles, TrendingUp, FileText, Heart, BarChart3,
    BookmarkX, StarOff, ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const API_URL = import.meta.env.VITE_API_URL;

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Star Rating Display ────────────────────────────────────────────────────────

function StarRating({ averageScore, totalRatings }) {
    const starRating = averageScore !== null
        ? (averageScore / 20).toFixed(1)
        : '5.0';
    const starValue = parseFloat(starRating);
    const fullStars = Math.floor(starValue);
    const hasHalfStar = starValue - fullStars >= 0.3;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
                {hasHalfStar && (
                    <div className="relative w-3.5 h-3.5">
                        <Star className="absolute inset-0 w-3.5 h-3.5 text-gray-200 fill-gray-200" />
                        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        </div>
                    </div>
                )}
                {[...Array(Math.max(0, emptyStars))].map((_, i) => (
                    <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-gray-200 fill-gray-200" />
                ))}
            </div>
            <span className="text-sm font-bold text-gray-700">{starRating}</span>
            <span className="text-xs text-gray-400">({totalRatings})</span>
        </div>
    );
}

// ─── Effectiveness Badge ────────────────────────────────────────────────────────

const RATING_LABELS = {
    '0-10': { label: '0–10%', color: 'bg-red-50 text-red-700 border-red-200', emoji: '😟' },
    '10-50': { label: '10–50%', color: 'bg-amber-50 text-amber-700 border-amber-200', emoji: '🤔' },
    '50-80': { label: '50–80%', color: 'bg-blue-50 text-blue-700 border-blue-200', emoji: '👍' },
    '80-100': { label: '80–100%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', emoji: '🚀' },
};

// ─── Template List Card ─────────────────────────────────────────────────────────

function LibraryCard({ template, extraInfo, onUnsave }) {
    const ratingInfo = template.ratingInfo || { averageScore: null, totalRatings: 0 };

    return (
        <motion.div
            variants={itemVariants}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
            layout
        >
            <div className="p-5 flex-1 flex flex-col">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {template.industry?.llm?.name && (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 rounded-full border border-purple-200 inline-flex items-center gap-1">
                            <Bot size={11} />
                            {template.industry.llm.name}
                        </span>
                    )}
                    <span className="px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                        {template.industry?.name || 'General'}
                    </span>
                    {template.category && (
                        <span className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full border border-gray-100">
                            {template.category?.name}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-2">
                    {template.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
                    {template.description}
                </p>

                {/* Extra Info (e.g., user rating, copy count, saved date) */}
                {extraInfo && (
                    <div className="mb-4">
                        {extraInfo}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <StarRating
                        averageScore={ratingInfo.averageScore}
                        totalRatings={ratingInfo.totalRatings}
                    />
                    <div className="flex items-center gap-2">
                        {onUnsave && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onUnsave(template._id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove"
                            >
                                <BookmarkX size={16} />
                            </button>
                        )}
                        <Link
                            to={`/template/${template._id}`}
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold text-sm group/btn"
                        >
                            View
                            <ArrowRight className="w-4 h-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description }) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm">{description}</p>
            <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
                <Sparkles className="w-4 h-4" />
                Browse Templates
            </Link>
        </motion.div>
    );
}

// ─── Tab Configuration ──────────────────────────────────────────────────────────

const TABS = [
    { key: 'saved', label: 'Saved', icon: Bookmark, color: 'indigo' },
    { key: 'rated', label: 'Rated', icon: Star, color: 'amber' },
    { key: 'copied', label: 'Recently Copied', icon: Copy, color: 'emerald' },
];

// ─── Main MyLibrary Component ───────────────────────────────────────────────────

export default function MyLibrary() {
    const { userInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('saved');
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ savedCount: 0, ratedCount: 0, copiedCount: 0, totalCopies: 0 });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Fetch stats
    useEffect(() => {
        if (!userInfo?.token) return;
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_URL}/api/user-library/stats`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };
        fetchStats();
    }, [userInfo?.token]);

    // Fetch template list based on active tab
    const fetchTemplates = useCallback(async () => {
        if (!userInfo?.token) return;
        setLoading(true);

        const endpoints = {
            saved: '/api/user-library/saved',
            rated: '/api/user-library/rated',
            copied: '/api/user-library/copies',
        };

        try {
            const res = await fetch(`${API_URL}${endpoints[activeTab]}?page=${page}&limit=12`, {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTemplates(data.result || []);
                setTotalPages(data.pages || 1);
            }
        } catch (err) {
            console.error('Failed to fetch templates:', err);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    }, [userInfo?.token, activeTab, page]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // Reset page when tab changes
    useEffect(() => {
        setPage(1);
    }, [activeTab]);

    const handleUnsave = async (templateId) => {
        try {
            const res = await fetch(`${API_URL}/api/user-library/save/${templateId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            if (res.ok) {
                toast.success('Template removed from saved');
                setTemplates(prev => prev.filter(t => t._id !== templateId));
                setStats(prev => ({ ...prev, savedCount: prev.savedCount - 1 }));
            }
        } catch (err) {
            toast.error('Failed to unsave template');
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'week', seconds: 604800 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
        ];
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
        }
        return 'Just now';
    };

    const renderExtraInfo = (template) => {
        if (activeTab === 'rated' && template.userRating) {
            const ratingConfig = RATING_LABELS[template.userRating];
            return (
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border ${ratingConfig?.color || ''}`}>
                        <span>{ratingConfig?.emoji}</span>
                        Your rating: {ratingConfig?.label}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(template.ratedAt)}
                    </span>
                </div>
            );
        }
        if (activeTab === 'copied') {
            return (
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                        <Copy size={12} />
                        Copied {template.copyCount} time{template.copyCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(template.lastCopiedAt)}
                    </span>
                </div>
            );
        }
        if (activeTab === 'saved' && template.savedAt) {
            return (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Bookmark size={12} className="text-indigo-400" />
                    Saved {timeAgo(template.savedAt)}
                </span>
            );
        }
        return null;
    };

    const statCards = [
        {
            label: 'Saved Templates',
            value: stats.savedCount,
            icon: Bookmark,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            gradient: 'from-indigo-500 to-violet-500',
        },
        {
            label: 'Rated Templates',
            value: stats.ratedCount,
            icon: BarChart3,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            label: 'Templates Copied',
            value: stats.copiedCount,
            icon: Copy,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            label: 'Total Copies',
            value: stats.totalCopies,
            icon: TrendingUp,
            color: 'text-violet-600',
            bg: 'bg-violet-100',
            gradient: 'from-violet-500 to-purple-500',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 pb-20">
            {/* ── Hero Header ── */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                                My Library
                            </h1>
                        </div>
                        <p className="text-lg text-white/70 mt-2">
                            Your personal collection of saved, rated, and recently copied templates.
                        </p>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/15 transition-all cursor-default"
                                whileHover={{ scale: 1.02, y: -2 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.08 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/15`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-extrabold text-white">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-white/60 font-medium">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                {/* Tab Navigation */}
                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 flex gap-1 mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const count = tab.key === 'saved' ? stats.savedCount
                            : tab.key === 'rated' ? stats.ratedCount
                                : stats.copiedCount;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                id={`tab-${tab.key}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* Template Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-pulse" />
                            <div className="absolute inset-0 w-16 h-16 rounded-2xl border-4 border-indigo-200 animate-spin border-t-transparent" />
                        </div>
                    </div>
                ) : templates.length === 0 ? (
                    <AnimatePresence mode="wait">
                        <motion.div key={activeTab}>
                            {activeTab === 'saved' && (
                                <EmptyState
                                    icon={BookmarkX}
                                    title="No saved templates yet"
                                    description="Save templates you love by clicking the bookmark icon on any template. They'll appear here for easy access."
                                />
                            )}
                            {activeTab === 'rated' && (
                                <EmptyState
                                    icon={StarOff}
                                    title="No rated templates yet"
                                    description="Rate the effectiveness of templates you've tried. Your ratings help others find the best prompts."
                                />
                            )}
                            {activeTab === 'copied' && (
                                <EmptyState
                                    icon={ClipboardList}
                                    title="No copied templates yet"
                                    description="When you copy a prompt, it'll be recorded here so you can easily find and reuse it later."
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            key={`${activeTab}-${page}`}
                        >
                            {templates.map((template) => (
                                <LibraryCard
                                    key={template._id}
                                    template={template}
                                    extraInfo={renderExtraInfo(template)}
                                    onUnsave={activeTab === 'saved' ? handleUnsave : null}
                                />
                            ))}
                        </motion.div>

                        {totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    totalItems={templates.length}
                                    itemsPerPage={12}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
