import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Copy, Check, Lock, Edit3, Save, X, ChevronDown, ChevronUp,
    MessageSquare, Send, Reply, Shield, Award, Clock, User, Image as ImageIcon,
    ZoomIn, ChevronLeft, ChevronRight, Eye, Variable, FileText, Sparkles, Layers,
    ThumbsUp, BarChart3, TrendingUp, Bookmark, Palette, Layout, Lightbulb, Info, Tag,
    AlertTriangle, Zap, Star, ClipboardCheck, Rocket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
    animate: {
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};

const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2 } }
};

const expandCollapse = {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.2 } }
};

// ─── Role Badge Component ───────────────────────────────────────────────────────

function RoleBadge({ role }) {
    const config = {
        admin: {
            label: 'Admin',
            icon: Shield,
            bg: 'bg-red-50 dark:bg-red-900/30',
            text: 'text-red-700 dark:text-red-400',
            border: 'border-red-200 dark:border-red-800',
            ring: 'ring-red-100 dark:ring-red-900/20'
        },
        expert: {
            label: 'Expert',
            icon: Award,
            bg: 'bg-amber-50 dark:bg-amber-900/30',
            text: 'text-amber-700 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-800',
            ring: 'ring-amber-100 dark:ring-amber-900/20'
        },
        user: {
            label: 'User',
            icon: User,
            bg: 'bg-slate-50 dark:bg-slate-800',
            text: 'text-slate-600 dark:text-slate-400',
            border: 'border-slate-200 dark:border-slate-700',
            ring: 'ring-slate-100 dark:ring-slate-900/20'
        },
    };
    const c = config[role] || config.user;
    const Icon = c.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${c.bg} ${c.text} ${c.border} ring-1 ${c.ring}`}>
            <Icon className="w-3 h-3" />
            {c.label}
        </span>
    );
}

// ─── Image Preview Modal ────────────────────────────────────────────────────────

function ImagePreviewModal({ images, currentIndex, onClose, onNavigate }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onNavigate(-1);
            if (e.key === 'ArrowRight') onNavigate(1);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose, onNavigate]);

    const [zoomed, setZoomed] = useState(false);
    const imgSrc = images[currentIndex]?.startsWith('http')
        ? images[currentIndex]
        : `${API_URL}/${images[currentIndex]}`;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <motion.div
                className="relative z-10 max-w-5xl max-h-[90vh] w-full mx-4"
                {...scaleIn}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
                    id="modal-close-btn"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => onNavigate(-1)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
                            id="modal-prev-btn"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => onNavigate(1)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
                            id="modal-next-btn"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Zoom toggle */}
                <button
                    onClick={() => setZoomed(!zoomed)}
                    className="absolute top-3 right-3 z-20 p-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-lg backdrop-blur-sm transition-all"
                    id="modal-zoom-btn"
                >
                    <ZoomIn className="w-5 h-5" />
                </button>

                {/* Image */}
                <div className={`overflow-auto rounded-2xl bg-black/40 ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                    onClick={() => setZoomed(!zoomed)}
                >
                    <img
                        src={imgSrc}
                        alt={`Sample output ${currentIndex + 1}`}
                        className={`w-full transition-transform duration-300 ${zoomed ? 'scale-150' : 'scale-100'} object-contain max-h-[85vh]`}
                        draggable={false}
                    />
                </div>

                {/* Counter */}
                {images.length > 1 && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

// ─── Sample Output Images Section ───────────────────────────────────────────────

function SampleOutputSection({ images }) {
    const [previewIndex, setPreviewIndex] = useState(null);

    if (!images || images.length === 0) return null;

    return (
        <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sample Outputs</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((img, i) => {
                        const src = img.startsWith('http') ? img : `${API_URL}/${img}`;
                        return (
                            <motion.div
                                key={i}
                                className="group relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
                                whileHover={{ scale: 1.02, y: -2 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setPreviewIndex(i)}
                                id={`sample-output-${i}`}
                            >
                                <img
                                    src={src}
                                    alt={`Sample ${i + 1}`}
                                    className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-800 dark:text-gray-100 shadow-sm border border-black/5 dark:border-white/10">
                                        <Eye className="w-3.5 h-3.5" />
                                        Preview
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence>
                {previewIndex !== null && (
                    <ImagePreviewModal
                        images={images}
                        currentIndex={previewIndex}
                        onClose={() => setPreviewIndex(null)}
                        onNavigate={(dir) => {
                            setPreviewIndex(prev => {
                                const next = prev + dir;
                                if (next < 0) return images.length - 1;
                                if (next >= images.length) return 0;
                                return next;
                            });
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Editable Variables Section ─────────────────────────────────────────────────

function VariablesSection({ variables, userValues, setUserValues, isLoggedIn }) {
    const [editingVar, setEditingVar] = useState(null);
    const [draftValue, setDraftValue] = useState('');

    if (!variables || variables.length === 0) return null;

    const startEdit = (v) => {
        if (!isLoggedIn) {
            toast.error('Please login to customize variables', { icon: '🔒' });
            return;
        }
        setEditingVar(v.name);
        setDraftValue(userValues[v.name] ?? v.defaultValue ?? '');
    };

    const saveEdit = (v) => {
        if (v.required && !draftValue.trim()) {
            toast.error(`"${v.name}" is required and cannot be empty`);
            return;
        }
        setUserValues(prev => ({ ...prev, [v.name]: draftValue.trim() }));
        setEditingVar(null);
        toast.success(`Variable "${v.name}" updated`);
    };

    const cancelEdit = () => {
        setEditingVar(null);
        setDraftValue('');
    };

    return (
        <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl">
                        <Variable className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editable Variables</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Customize values before copying the prompt</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {variables.map((v, i) => {
                        const isEditing = editingVar === v.name;
                        const currentValue = userValues[v.name] ?? v.defaultValue ?? '';
                        const hasCustomValue = userValues[v.name] !== undefined && userValues[v.name] !== v.defaultValue;

                        return (
                            <motion.div
                                key={v.name}
                                className={`rounded-xl border transition-all duration-200 ${isEditing ? 'border-indigo-300 dark:border-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50'}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                id={`variable-card-${v.name}`}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <code className="text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-md">
                                                    {`{{${v.name}}}`}
                                                </code>
                                                {v.required && (
                                                    <span className="text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">Required</span>
                                                )}
                                                {hasCustomValue && (
                                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">Customized</span>
                                                )}
                                            </div>
                                            {v.description && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{v.description}</p>
                                            )}

                                            {isEditing ? (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={draftValue}
                                                        onChange={(e) => setDraftValue(e.target.value)}
                                                        className="flex-1 px-3 py-2 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                        placeholder={`Enter value for ${v.name}`}
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveEdit(v);
                                                            if (e.key === 'Escape') cancelEdit();
                                                        }}
                                                        id={`variable-input-${v.name}`}
                                                    />
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => saveEdit(v)}
                                                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                        id={`variable-save-${v.name}`}
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={cancelEdit}
                                                        className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                                                        {currentValue || <span className="italic text-gray-400 dark:text-gray-500">No default value</span>}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <div className="relative group/edit">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => startEdit(v)}
                                                    className={`p-2 rounded-lg transition-colors ${isLoggedIn ? 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50' : 'text-gray-300 cursor-not-allowed'}`}
                                                    disabled={!isLoggedIn}
                                                    id={`variable-edit-${v.name}`}
                                                >
                                                    {isLoggedIn ? <Edit3 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                </motion.button>
                                                {!isLoggedIn && (
                                                    <div className="absolute bottom-full right-0 mb-2 w-40 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/edit:opacity-100 transition-opacity pointer-events-none z-10">
                                                        <div className="absolute bottom-0 right-3 translate-y-1 w-2 h-2 bg-gray-900 rotate-45" />
                                                        Login required to edit
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Save/Bookmark Button ───────────────────────────────────────────────────────

function SaveButton({ templateId, isLoggedIn, userInfo }) {
    const [isSaved, setIsSaved] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const fetchSaveStatus = useCallback(async () => {
        try {
            const headers = {};
            if (userInfo?.token) headers.Authorization = `Bearer ${userInfo.token}`;
            const res = await fetch(`${API_URL}/api/user-library/save/${templateId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setIsSaved(data.isSaved);
            }
        } catch (err) {
            console.error('Error fetching save status:', err);
        } finally {
            setLoaded(true);
        }
    }, [templateId, userInfo]);

    useEffect(() => { fetchSaveStatus(); }, [fetchSaveStatus]);

    const handleToggle = async () => {
        if (!isLoggedIn) {
            toast.error('Please login to save templates', { icon: '🔒' });
            return;
        }
        if (toggling) return;

        setToggling(true);
        const previousState = isSaved;
        setIsSaved(!isSaved); // optimistic update

        try {
            const res = await fetch(`${API_URL}/api/user-library/save/${templateId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setIsSaved(data.isSaved);
                toast.success(data.isSaved ? 'Template saved!' : 'Template removed from saved', {
                    icon: data.isSaved ? '🔖' : '📌',
                });
            } else {
                setIsSaved(previousState);
                toast.error('Failed to update save');
            }
        } catch (err) {
            setIsSaved(previousState);
            toast.error('Error saving template');
        } finally {
            setToggling(false);
        }
    };

    if (!loaded) return null;

    return (
        <motion.button
            onClick={handleToggle}
            disabled={toggling}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border-2 ${isSaved
                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 shadow-sm shadow-amber-100 dark:shadow-none'
                : isLoggedIn
                    ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-800 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/20'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-800 cursor-default'
                }`}
            whileHover={isLoggedIn ? { scale: 1.03, y: -1 } : {}}
            whileTap={isLoggedIn ? { scale: 0.97 } : {}}
            id="save-template-btn"
        >
            <motion.div
                animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
            >
                <Bookmark className={`w-5 h-5 transition-colors ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </motion.div>
            <span>{isSaved ? 'Saved' : 'Save'}</span>
        </motion.button>
    );
}

// ─── Prompt Copy Section with Variable Replacement ──────────────────────────────

function PromptSection({ template, userValues, isLoggedIn, userInfo, templateId }) {
    const [copied, setCopied] = useState(false);
    const promptRef = useRef(null);

    const getProcessedPrompt = useCallback(() => {
        let prompt = template.basePromptText || '';
        if (template.variables && template.variables.length > 0) {
            template.variables.forEach(v => {
                const value = (userValues[v.name] ?? v.defaultValue ?? '').trim();
                const pattern = new RegExp(`\\{\\{${v.name}\\}\\}`, 'g');
                prompt = prompt.replace(pattern, value || `{{${v.name}}}`);
            });
        }
        return prompt;
    }, [template, userValues]);

    // ── Copy protection for non-logged-in users ──────────────────────────────
    useEffect(() => {
        if (isLoggedIn) return; // No restrictions for logged-in users

        const promptEl = promptRef.current;
        if (!promptEl) return;

        // Block Ctrl+C / Cmd+C keyboard shortcut
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                toast.error('Please login to copy prompts', { icon: <Lock className="w-4 h-4 text-gray-500" /> });
            }
        };

        // Block right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            toast.error('Please login to copy prompts', { icon: <Lock className="w-4 h-4 text-gray-500" /> });
        };

        // Intercept the native copy event
        const handleCopyEvent = (e) => {
            e.preventDefault();
            toast.error('Please login to copy prompts', { icon: <Lock className="w-4 h-4 text-gray-500" /> });
        };

        // Clear any text selection made by dragging
        const handleMouseUp = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                selection.removeAllRanges();
                toast.error('Please login to copy prompts', { icon: <Lock className="w-4 h-4 text-gray-500" /> });
            }
        };

        promptEl.addEventListener('keydown', handleKeyDown);
        promptEl.addEventListener('contextmenu', handleContextMenu);
        promptEl.addEventListener('copy', handleCopyEvent);
        promptEl.addEventListener('mouseup', handleMouseUp);

        return () => {
            promptEl.removeEventListener('keydown', handleKeyDown);
            promptEl.removeEventListener('contextmenu', handleContextMenu);
            promptEl.removeEventListener('copy', handleCopyEvent);
            promptEl.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isLoggedIn]);

    const handleCopy = async () => {
        if (!isLoggedIn) {
            toast.error('Please login to copy prompts', { icon: <Lock className="w-4 h-4 text-gray-500" /> });
            return;
        }

        // Validation: check if any required variable is empty
        if (template.variables) {
            const missingRequired = template.variables.filter(v => {
                if (!v.required) return false;
                const val = (userValues[v.name] ?? v.defaultValue ?? '').trim();
                return !val;
            });
            if (missingRequired.length > 0) {
                toast.error(`Required variable(s) missing: ${missingRequired.map(v => v.name).join(', ')}`);
                return;
            }
        }

        const processedPrompt = getProcessedPrompt();

        try {
            await navigator.clipboard.writeText(processedPrompt);
            setCopied(true);
            toast.success('Prompt copied to clipboard!', { icon: <ClipboardCheck className="w-4 h-4 text-emerald-500" /> });
            setTimeout(() => setCopied(false), 2500);

            // Track copy event
            if (userInfo?.token && templateId) {
                fetch(`${API_URL}/api/user-library/copy/${templateId}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                }).catch(err => console.error('Failed to track copy:', err));
            }
        } catch (err) {
            toast.error('Failed to copy to clipboard');
        }
    };

    // Highlight variables in the prompt text
    const renderHighlightedPrompt = () => {
        const text = template.basePromptText || '';
        const parts = text.split(/({{[^}]+}})/g);

        return parts.map((part, i) => {
            const varMatch = part.match(/^{{(.+)}}$/);
            if (varMatch) {
                const varName = varMatch[1];
                const customValue = userValues[varName];
                const variable = template.variables?.find(v => v.name === varName);
                const displayValue = customValue ?? variable?.defaultValue;

                return (
                    <span
                        key={i}
                        className={`inline-block px-1.5 py-0.5 rounded font-semibold transition-colors ${displayValue ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800'}`}
                        title={displayValue ? `Will be replaced with: ${displayValue}` : 'No value set'}
                    >
                        {displayValue || part}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Prompt</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Variables are highlighted for replacement</p>
                        </div>
                    </div>
                    <div className="relative group/copy">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopy}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${copied
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                : isLoggedIn
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                }`}
                            disabled={!isLoggedIn}
                            id="copy-prompt-btn"
                        >
                            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Prompt</>}
                        </motion.button>
                        {!isLoggedIn && (
                            <div className="absolute bottom-full right-0 mb-2 w-44 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/copy:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                <div className="absolute bottom-0 right-4 translate-y-1 w-2 h-2 bg-gray-900 rotate-45" />
                                Login required to copy
                            </div>
                        )}
                    </div>
                </div>

                <div
                    ref={promptRef}
                    className="relative bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                    tabIndex={0}
                    style={!isLoggedIn ? { userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' } : {}}
                    onDragStart={!isLoggedIn ? (e) => e.preventDefault() : undefined}
                >
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-100 dark:from-gray-800 to-transparent flex items-center px-4">
                        <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-300 dark:bg-red-400"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 dark:bg-amber-400"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-green-300 dark:bg-green-400"></span>
                        </div>
                    </div>
                    <div className="pt-10 pb-6 px-5 max-h-96 overflow-y-auto scrollbar-thin">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-gray-700 dark:text-gray-300">
                            {renderHighlightedPrompt()}
                        </pre>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Single Comment Component ──────────────────────────────────────────────────

function CommentItem({ comment, depth = 0, isLoggedIn, userInfo, onReply, onDelete }) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [collapsed, setCollapsed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isOfficialReply = comment.role === 'admin' || comment.role === 'expert';
    const maxIndent = 4; // max depth for visual indentation
    const indentLevel = Math.min(depth, maxIndent);

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) return;
        setSubmitting(true);
        await onReply(comment._id, replyContent.trim());
        setReplyContent('');
        setShowReplyBox(false);
        setSubmitting(false);
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        const intervals = [
            { label: 'y', seconds: 31536000 },
            { label: 'mo', seconds: 2592000 },
            { label: 'w', seconds: 604800 },
            { label: 'd', seconds: 86400 },
            { label: 'h', seconds: 3600 },
            { label: 'm', seconds: 60 },
        ];
        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) return `${count}${interval.label} ago`;
        }
        return 'Just now';
    };

    const canDelete = userInfo && (
        comment.userId?._id === userInfo._id || userInfo.role === 'Admin'
    );

    return (
        <motion.div
            className={`${indentLevel > 0 ? 'ml-6 sm:ml-8' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`relative rounded-xl p-4 transition-all ${isOfficialReply
                ? 'bg-gradient-to-r from-indigo-50/80 to-violet-50/50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200 dark:border-indigo-800 shadow-sm'
                : 'bg-gray-50/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                }`}>
                {/* Thread line */}
                {indentLevel > 0 && (
                    <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-gray-200 dark:from-indigo-800 dark:via-gray-700 to-transparent" />
                )}

                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isOfficialReply
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
                        : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 text-white'
                        }`}>
                        {comment.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-semibold ${isOfficialReply ? 'text-indigo-900 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-200'}`}>
                                {comment.userId?.name || 'Unknown User'}
                            </span>
                            <RoleBadge role={comment.role} />
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeAgo(comment.createdAt)}
                            </span>
                        </div>

                        <p className={`mt-1.5 text-sm leading-relaxed ${isOfficialReply ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                            {comment.content}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                            {isLoggedIn && (
                                <button
                                    onClick={() => setShowReplyBox(!showReplyBox)}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors"
                                    id={`reply-btn-${comment._id}`}
                                >
                                    <Reply className="w-3.5 h-3.5" />
                                    Reply
                                </button>
                            )}
                            {canDelete && (
                                <button
                                    onClick={() => onDelete(comment._id)}
                                    className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                                    id={`delete-comment-${comment._id}`}
                                >
                                    Delete
                                </button>
                            )}
                            {comment.replies?.length > 0 && (
                                <button
                                    onClick={() => setCollapsed(!collapsed)}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                    {collapsed ? `Show ${comment.replies.length} replies` : 'Collapse'}
                                </button>
                            )}
                        </div>

                        {/* Reply Box */}
                        <AnimatePresence>
                            {showReplyBox && (
                                <motion.div
                                    className="mt-3"
                                    {...expandCollapse}
                                >
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="Write a reply..."
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600"
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !submitting) handleSubmitReply(); }}
                                            id={`reply-input-${comment._id}`}
                                        />
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleSubmitReply}
                                            disabled={!replyContent.trim() || submitting}
                                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Replies */}
            <AnimatePresence>
                {!collapsed && comment.replies?.length > 0 && (
                    <motion.div
                        className="mt-2 space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                depth={depth + 1}
                                isLoggedIn={isLoggedIn}
                                userInfo={userInfo}
                                onReply={onReply}
                                onDelete={onDelete}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Comments Section ──────────────────────────────────────────────────────────

function CommentsSection({ templateId, isLoggedIn, userInfo }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/comments/${templateId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        } finally {
            setLoadingComments(false);
        }
    }, [templateId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmitComment = async () => {
        if (!newComment.trim() || submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/comments/${templateId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({ content: newComment.trim() }),
            });
            if (res.ok) {
                setNewComment('');
                toast.success('Comment posted!');
                fetchComments();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to post comment');
            }
        } catch (err) {
            toast.error('Error posting comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (parentId, content) => {
        try {
            const res = await fetch(`${API_URL}/api/comments/${templateId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({ content, parentId }),
            });
            if (res.ok) {
                toast.success('Reply posted!');
                fetchComments();
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to post reply');
            }
        } catch (err) {
            toast.error('Error posting reply');
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            if (res.ok) {
                toast.success('Comment deleted');
                fetchComments();
            } else {
                toast.error('Failed to delete comment');
            }
        } catch (err) {
            toast.error('Error deleting comment');
        }
    };

    return (
        <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Discussion</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* New Comment Input */}
                {isLoggedIn ? (
                    <div className="flex gap-3 mb-6 items-start">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                            {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={3}
                                className="w-full px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-300 dark:focus:border-indigo-600 resize-none transition-all"
                                id="new-comment-input"
                            />
                            <div className="flex justify-end mt-2">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleSubmitComment}
                                    disabled={!newComment.trim() || submitting}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    id="submit-comment-btn"
                                >
                                    <Send className="w-4 h-4" />
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-center">
                        <Lock className="w-5 h-5 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold">Login</Link> to join the discussion
                        </p>
                    </div>
                )}

                {/* Comments List */}
                {loadingComments ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {comments.map(comment => (
                            <CommentItem
                                key={comment._id}
                                comment={comment}
                                depth={0}
                                isLoggedIn={isLoggedIn}
                                userInfo={userInfo}
                                onReply={handleReply}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Effectiveness Rating Section ──────────────────────────────────────────────

const RATING_RANGES = [
    {
        key: '0-10',
        label: '0–10%',
        color: 'from-red-500 to-rose-400',
        bgLight: 'bg-red-50 dark:bg-red-950/30',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
        ringColor: 'ring-red-100 dark:ring-red-950/50',
        icon: AlertTriangle,
        iconColor: 'text-red-500 dark:text-red-400'
    },
    {
        key: '10-50',
        label: '10–50%',
        color: 'from-amber-500 to-orange-400',
        bgLight: 'bg-amber-50 dark:bg-amber-950/30',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-800',
        ringColor: 'ring-amber-100 dark:ring-amber-950/50',
        icon: Zap,
        iconColor: 'text-amber-500 dark:text-amber-400'
    },
    {
        key: '50-80',
        label: '50–80%',
        color: 'from-blue-500 to-cyan-400',
        bgLight: 'bg-blue-50 dark:bg-blue-950/30',
        textColor: 'text-blue-700 dark:text-blue-400',
        borderColor: 'border-blue-200 dark:border-blue-800',
        ringColor: 'ring-blue-100 dark:ring-blue-950/50',
        icon: ThumbsUp,
        iconColor: 'text-blue-500 dark:text-blue-400'
    },
    {
        key: '80-100',
        label: '80–100%',
        color: 'from-emerald-500 to-green-400',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        ringColor: 'ring-emerald-100 dark:ring-emerald-950/50',
        icon: Rocket,
        iconColor: 'text-emerald-500 dark:text-emerald-400'
    },
];

function EffectivenessRatingSection({ templateId, isLoggedIn, userInfo }) {
    const [ratingData, setRatingData] = useState(null);
    const [selectedRange, setSelectedRange] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loadingRating, setLoadingRating] = useState(true);

    const fetchRatings = useCallback(async () => {
        try {
            const headers = {};
            if (userInfo?.token) headers.Authorization = `Bearer ${userInfo.token}`;
            const res = await fetch(`${API_URL}/api/ratings/${templateId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setRatingData(data);
                if (data.userRating) setSelectedRange(data.userRating);
            }
        } catch (err) {
            console.error('Error fetching ratings:', err);
        } finally {
            setLoadingRating(false);
        }
    }, [templateId, userInfo]);

    useEffect(() => { fetchRatings(); }, [fetchRatings]);

    const handleRatingSelect = async (rangeKey) => {
        if (!isLoggedIn) {
            toast.error('Please login to rate this template', { icon: <Lock className="w-4 h-4 text-gray-500" /> });
            return;
        }
        if (submitting) return;

        setSubmitting(true);
        const previousRange = selectedRange;
        setSelectedRange(rangeKey); // optimistic update

        try {
            const res = await fetch(`${API_URL}/api/ratings/${templateId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({ effectivenessRange: rangeKey }),
            });
            if (res.ok) {
                toast.success(
                    previousRange && previousRange !== rangeKey
                        ? 'Rating updated!'
                        : 'Rating submitted!',
                    { icon: <Star className="w-4 h-4 text-amber-500" /> }
                );
                fetchRatings(); // refresh aggregated data
            } else {
                setSelectedRange(previousRange); // rollback
                const data = await res.json();
                toast.error(data.message || 'Failed to submit rating');
            }
        } catch (err) {
            setSelectedRange(previousRange);
            toast.error('Error submitting rating');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingRating) {
        return (
            <motion.div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6" {...staggerItem}>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500" />
                </div>
            </motion.div>
        );
    }

    const totalRatings = ratingData?.totalRatings || 0;
    const distribution = ratingData?.distribution || {};
    const averageScore = ratingData?.averageScore;

    return (
        <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Effectiveness Rating</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{totalRatings} rating{totalRatings !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Average Score Badge */}
                {averageScore !== null && averageScore !== undefined && (
                    <motion.div
                        className="mb-5 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-800"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Average Effectiveness</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400">{averageScore}%</span>
                            </div>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-2 h-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${averageScore}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Rating Range Options */}
                <div className="space-y-2.5">
                    {RATING_RANGES.map((range, i) => {
                        const isSelected = selectedRange === range.key;
                        const count = distribution[range.key] || 0;
                        const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

                        return (
                            <motion.button
                                key={range.key}
                                onClick={() => handleRatingSelect(range.key)}
                                disabled={submitting}
                                className={`w-full group relative rounded-xl border-2 transition-all duration-200 text-left overflow-hidden ${isSelected
                                    ? `${range.borderColor} ${range.bgLight} ring-2 ring-offset-1 dark:ring-offset-gray-900 ${range.ringColor}`
                                    : isLoggedIn
                                        ? 'border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/40 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        : 'border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 cursor-default'
                                    }`}
                                whileHover={isLoggedIn ? { scale: 1.01 } : {}}
                                whileTap={isLoggedIn ? { scale: 0.99 } : {}}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                id={`rating-option-${range.key}`}
                            >
                                <div className="px-4 py-3 flex items-center gap-3">
                                    {/* Radio indicator */}
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                        ? `${range.borderColor} ${range.bgLight}`
                                        : 'border-gray-300 dark:border-gray-600'
                                        }`}>
                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div
                                                    className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${range.color}`}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Label + Icon */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        {(() => { const RangeIcon = range.icon; return <RangeIcon className={`w-4 h-4 ${isSelected ? range.iconColor : 'text-gray-400 dark:text-gray-500'}`} />; })()}
                                        <span className={`text-sm font-semibold ${isSelected ? range.textColor : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {range.label}
                                        </span>
                                    </div>

                                    {/* Count + Bar */}
                                    <div className="flex-1 flex items-center gap-2 ml-auto">
                                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full bg-gradient-to-r ${range.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.06 }}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium w-8 text-right tabular-nums ${isSelected ? range.textColor : 'text-gray-400 dark:text-gray-500'
                                            }`}>
                                            {count}
                                        </span>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Login prompt for non-authenticated */}
                {!isLoggedIn && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold">Login</Link> to rate this template
                        </p>
                    </div>
                )}

                {/* Confirmation for logged-in user */}
                {isLoggedIn && selectedRange && (
                    <motion.div
                        className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Your rating: <strong className="text-gray-700 dark:text-gray-300">{RATING_RANGES.find(r => r.key === selectedRange)?.label}</strong></span>
                        <span className="text-gray-400 dark:text-gray-500">· Tap another to change</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Upvote Button ─────────────────────────────────────────────────────────────

function UpvoteButton({ templateId, isLoggedIn, userInfo }) {
    const [hasUpvoted, setHasUpvoted] = useState(false);
    const [count, setCount] = useState(0);
    const [toggling, setToggling] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const fetchUpvoteStatus = useCallback(async () => {
        try {
            const headers = {};
            if (userInfo?.token) headers.Authorization = `Bearer ${userInfo.token}`;
            const res = await fetch(`${API_URL}/api/ratings/${templateId}/upvote`, { headers });
            if (res.ok) {
                const data = await res.json();
                setHasUpvoted(data.hasUpvoted);
                setCount(data.count);
            }
        } catch (err) {
            console.error('Error fetching upvote:', err);
        } finally {
            setLoaded(true);
        }
    }, [templateId, userInfo]);

    useEffect(() => { fetchUpvoteStatus(); }, [fetchUpvoteStatus]);

    const handleToggle = async () => {
        if (!isLoggedIn) {
            toast.error('Please login to upvote', { icon: <Lock className="w-4 h-4 text-gray-500" /> });
            return;
        }
        if (toggling) return;

        setToggling(true);
        const previousState = hasUpvoted;
        const previousCount = count;

        // Optimistic update
        setHasUpvoted(!hasUpvoted);
        setCount(prev => hasUpvoted ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`${API_URL}/api/ratings/${templateId}/upvote`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${userInfo.token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setHasUpvoted(data.hasUpvoted);
                setCount(data.count);
            } else {
                setHasUpvoted(previousState);
                setCount(previousCount);
                toast.error('Failed to update upvote');
            }
        } catch (err) {
            setHasUpvoted(previousState);
            setCount(previousCount);
            toast.error('Error toggling upvote');
        } finally {
            setToggling(false);
        }
    };

    if (!loaded) return null;

    return (
        <motion.button
            onClick={handleToggle}
            disabled={toggling}
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border-2 ${hasUpvoted
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-sm shadow-indigo-100 dark:shadow-none'
                : isLoggedIn
                    ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border-gray-100 dark:border-gray-800 cursor-default'
                }`}
            whileHover={isLoggedIn ? { scale: 1.03, y: -1 } : {}}
            whileTap={isLoggedIn ? { scale: 0.97 } : {}}
            id="upvote-btn"
        >
            <motion.div
                animate={hasUpvoted ? { rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.4 }}
            >
                <ThumbsUp className={`w-5 h-5 transition-colors ${hasUpvoted ? 'fill-indigo-500 text-indigo-500' : ''}`} />
            </motion.div>
            <AnimatePresence mode="wait">
                <motion.span
                    key={count}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="tabular-nums"
                >
                    {count}
                </motion.span>
            </AnimatePresence>
            <span className="text-xs opacity-60">Upvote{count !== 1 ? 's' : ''}</span>
        </motion.button>
    );
}

// ─── Collapsible Text Component ─────────────────────────────────────────────────

function CollapsibleText({ text, clampLines = 3 }) {
    const [expanded, setExpanded] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
    const textRef = useRef(null);

    useEffect(() => {
        const el = textRef.current;
        if (el) {
            // Check if content overflows the clamped height
            setIsClamped(el.scrollHeight > el.clientHeight + 1);
        }
    }, [text]);

    return (
        <div>
            <div
                ref={!expanded ? textRef : undefined}
                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-300 overflow-hidden"
                style={!expanded ? {
                    display: '-webkit-box',
                    WebkitLineClamp: clampLines,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                } : {}}
            >
                {text}
            </div>
            {(isClamped || expanded) && (
                <button
                    onClick={() => setExpanded(prev => !prev)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
                            Show Less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                            Show More
                        </>
                    )}
                </button>
            )}
        </div>
    );
}


// ─── Template Info Card (Tabbed Redesign) ──────────────────────────────────────


function TemplateInfoCard({ template, isLoggedIn }) {
    const [activeTab, setActiveTab] = useState('details');

    const tabs = [
        { key: 'details', label: 'Details', icon: Info },
        { key: 'usecase', label: 'Use Case', icon: Layers },
        { key: 'more', label: 'More', icon: Lightbulb },
    ];

    return (
        <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden sticky top-6"
            {...staggerItem}
        >
            {/* Card Header */}
            <div className="px-5 pt-5 pb-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-xl">
                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Template Info</h3>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                    }`}
                                id={`template-info-tab-${tab.key}`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-5 min-h-[180px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'details' && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {/* Output Format – card with CollapsibleText */}
                            {template.outputFormat && (
                                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/40 dark:from-indigo-900/20 dark:to-blue-900/10 border border-indigo-100 dark:border-indigo-800">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <Layout className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Output Format</span>
                                    </div>
                                    <CollapsibleText text={template.outputFormat} clampLines={3} />
                                </div>
                            )}

                            {/* Tone – card with CollapsibleText */}
                            {template.tone && (
                                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/40 dark:from-amber-900/20 dark:to-yellow-900/10 border border-amber-100 dark:border-amber-800">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <Palette className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-sm font-bold text-amber-900 dark:text-amber-300">Tone</span>
                                    </div>
                                    <CollapsibleText text={template.tone} clampLines={3} />
                                </div>
                            )}

                            {/* Compact info rows for short values */}
                            <div className="space-y-2.5">
                                {template.variables?.length > 0 && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                        <div className="flex-shrink-0 p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                                            <Variable className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">Variables</span>
                                        <span className="text-sm font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                            {template.variables.length} editable
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className={`flex-shrink-0 p-1.5 rounded-lg ${template.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-900/30' : template.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        <Tag className={`w-3.5 h-3.5 ${template.status === 'Approved' ? 'text-emerald-500 dark:text-emerald-400' : template.status === 'Pending' ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
                                            }`} />
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">Status</span>
                                    <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${template.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : template.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {template.status}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'usecase' && (
                        <motion.div
                            key="usecase"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {template.useCase ? (
                                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-bold text-blue-900 dark:text-blue-300">Use Case</span>
                                    </div>
                                    <CollapsibleText text={template.useCase} clampLines={3} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                                        <Layers className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">No use case documented</p>
                                </div>
                            )}

                            {template.structuralInstruction && (
                                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50/80 to-purple-50/40 dark:from-violet-900/20 dark:to-purple-900/10 border border-violet-100 dark:border-violet-800">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                        <span className="text-sm font-bold text-violet-900 dark:text-violet-300">Structural Instruction</span>
                                    </div>
                                    <CollapsibleText text={template.structuralInstruction} clampLines={3} />
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'more' && (
                        <motion.div
                            key="more"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {template.repurposingIdeas ? (
                                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-100 dark:border-amber-800">
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-sm font-bold text-amber-900 dark:text-amber-300">Repurposing Ideas</span>
                                    </div>
                                    <CollapsibleText text={template.repurposingIdeas} clampLines={3} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                                        <Lightbulb className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-400 dark:text-gray-500">No additional info available</p>
                                </div>
                            )}

                            {/* Created / Updated meta */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-1">Created</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {new Date(template.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-semibold mb-1">Updated</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {new Date(template.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Copy Prompt CTA */}
            <div className="px-5 pb-5">
                <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        if (!isLoggedIn) {
                            toast.error('Please login to copy prompts', { icon: <Lock className="w-4 h-4 text-gray-500" /> });
                            return;
                        }
                        document.getElementById('copy-prompt-btn')?.click();
                    }}
                    className={`w-full py-3.5 px-4 font-bold rounded-xl transition-all duration-200 ${isLoggedIn
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                    id="sidebar-copy-btn"
                >
                    {isLoggedIn ? (
                        <span className="flex items-center justify-center gap-2">
                            <Copy className="w-5 h-5" />
                            Copy Prompt
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Lock className="w-5 h-5" />
                            Login to Copy
                        </span>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}

// ─── Main Template Details Page ─────────────────────────────────────────────────

export default function TemplateDetails() {
    const { id } = useParams();
    const { userInfo } = useAuth();
    const isLoggedIn = !!userInfo;

    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userValues, setUserValues] = useState({});

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const headers = {};
                if (userInfo?.token) {
                    headers.Authorization = `Bearer ${userInfo.token}`;
                }
                const response = await fetch(`${API_URL}/api/templates/${id}`, { headers });
                if (!response.ok) throw new Error('Template not found');
                const data = await response.json();
                setTemplate(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchTemplate();
    }, [id, userInfo]);

    // ── Loading State ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-pulse" />
                        <div className="absolute inset-0 w-16 h-16 rounded-2xl border-4 border-indigo-200 dark:border-indigo-800 animate-spin border-t-transparent dark:border-t-transparent" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Loading template...</p>
                </motion.div>
            </div>
        );
    }

    // ── Error State ──
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 max-w-md"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                        <X className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Template Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen pb-20 transition-colors duration-200">
            {/* ── Hero Header ── */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-900 dark:via-purple-900 dark:to-indigo-950 overflow-hidden transition-colors duration-500">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 dark:bg-white/2 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/5 dark:bg-violet-600/5 blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Breadcrumb */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Templates
                        </Link>
                    </motion.div>

                    {template && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="px-3 py-1 text-xs font-bold bg-white/15 text-white rounded-full backdrop-blur-sm border border-white/10">
                                    {template.industry?.name || 'General'}
                                </span>
                                {template.category && (
                                    <span className="px-3 py-1 text-xs font-medium bg-white/10 text-white/90 rounded-full backdrop-blur-sm border border-white/10">
                                        {template.category.name}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                                {template.title}
                            </h1>
                            <p className="text-lg text-white/80 leading-relaxed max-w-3xl mb-6">
                                {template.description}
                            </p>

                            {/* Author Bar + Upvote */}
                            <div className="flex items-center justify-between pb-2 flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold border border-white/20">
                                        {template.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{template.user?.name || 'Unknown Author'}</p>
                                        <p className="text-xs text-white/60 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Updated {new Date(template.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                {/* Upvote + Save in header */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <SaveButton templateId={id} isLoggedIn={isLoggedIn} userInfo={userInfo} />
                                    <UpvoteButton templateId={id} isLoggedIn={isLoggedIn} userInfo={userInfo} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ── Main Content ── */}
            {template && (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {/* ── Left Column (2/3) ── */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Prompt Section – Full Width */}
                            <PromptSection
                                template={template}
                                userValues={userValues}
                                isLoggedIn={isLoggedIn}
                                userInfo={userInfo}
                                templateId={id}
                            />

                            {/* Variables Section */}
                            <VariablesSection
                                variables={template.variables}
                                userValues={userValues}
                                setUserValues={setUserValues}
                                isLoggedIn={isLoggedIn}
                            />

                            {/* Comments Section */}
                            <CommentsSection
                                templateId={id}
                                isLoggedIn={isLoggedIn}
                                userInfo={userInfo}
                            />
                        </div>

                        {/* ── Right Sidebar (1/3) ── */}
                        <div className="space-y-6">
                            {/* Sample Output Images */}
                            <SampleOutputSection images={template.sampleOutput} />

                            {/* Effectiveness Rating */}
                            <EffectivenessRatingSection
                                templateId={id}
                                isLoggedIn={isLoggedIn}
                                userInfo={userInfo}
                            />

                            {/* Quick Info Card – Tabbed Redesign */}
                            <TemplateInfoCard template={template} isLoggedIn={isLoggedIn} />
                        </div>
                    </motion.div>
                </main>
            )}
        </div>
    );
}
