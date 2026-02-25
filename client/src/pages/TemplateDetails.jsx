import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Copy, Check, Lock, Edit3, Save, X, ChevronDown, ChevronUp,
    MessageSquare, Send, Reply, Shield, Award, Clock, User, Image as ImageIcon,
    ZoomIn, ChevronLeft, ChevronRight, Eye, Variable, FileText, Sparkles, Layers,
    ThumbsUp, BarChart3, TrendingUp
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
        admin: { label: 'Admin', icon: Shield, bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-100' },
        expert: { label: 'Expert', icon: Award, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-100' },
        user: { label: 'User', icon: User, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', ring: 'ring-slate-100' },
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
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
                        <ImageIcon className="w-5 h-5 text-violet-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Sample Outputs</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((img, i) => {
                        const src = img.startsWith('http') ? img : `${API_URL}/${img}`;
                        return (
                            <motion.div
                                key={i}
                                className="group relative aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
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
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-800">
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
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                        <Variable className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Editable Variables</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Customize values before copying the prompt</p>
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
                                className={`rounded-xl border transition-all duration-200 ${isEditing ? 'border-indigo-300 ring-2 ring-indigo-100 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                id={`variable-card-${v.name}`}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <code className="text-sm font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                                                    {`{{${v.name}}}`}
                                                </code>
                                                {v.required && (
                                                    <span className="text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Required</span>
                                                )}
                                                {hasCustomValue && (
                                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Customized</span>
                                                )}
                                            </div>
                                            {v.description && (
                                                <p className="text-sm text-gray-500 mb-2">{v.description}</p>
                                            )}

                                            {isEditing ? (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={draftValue}
                                                        onChange={(e) => setDraftValue(e.target.value)}
                                                        className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
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
                                                        className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-gray-700 font-medium truncate">
                                                        {currentValue || <span className="italic text-gray-400">No default value</span>}
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

// ─── Prompt Copy Section with Variable Replacement ──────────────────────────────

function PromptSection({ template, userValues, isLoggedIn }) {
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
                toast.error('Please login to copy prompts', { icon: '🔒' });
            }
        };

        // Block right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            toast.error('Please login to copy prompts', { icon: '🔒' });
        };

        // Intercept the native copy event
        const handleCopyEvent = (e) => {
            e.preventDefault();
            toast.error('Please login to copy prompts', { icon: '🔒' });
        };

        // Clear any text selection made by dragging
        const handleMouseUp = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                selection.removeAllRanges();
                toast.error('Please login to copy prompts', { icon: '🔒' });
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
            toast.error('Please login to copy prompts', { icon: '🔒' });
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
            toast.success('Prompt copied to clipboard!', { icon: '📋' });
            setTimeout(() => setCopied(false), 2500);
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
                        className={`inline-block px-1.5 py-0.5 rounded font-semibold transition-colors ${displayValue ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}
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
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Prompt</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Variables are highlighted for replacement</p>
                        </div>
                    </div>
                    <div className="relative group/copy">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCopy}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${copied
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : isLoggedIn
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
                    className="relative bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 overflow-hidden"
                    tabIndex={0}
                    style={!isLoggedIn ? { userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' } : {}}
                    onDragStart={!isLoggedIn ? (e) => e.preventDefault() : undefined}
                >
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-100 to-transparent flex items-center px-4">
                        <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-300"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-green-300"></span>
                        </div>
                    </div>
                    <div className="pt-10 pb-6 px-5 max-h-96 overflow-y-auto scrollbar-thin">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-gray-700">
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
                ? 'bg-gradient-to-r from-indigo-50/80 to-violet-50/50 border border-indigo-200 shadow-sm'
                : 'bg-gray-50/80 border border-gray-100 hover:border-gray-200'
                }`}>
                {/* Thread line */}
                {indentLevel > 0 && (
                    <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-gray-200 to-transparent" />
                )}

                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isOfficialReply
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
                        : 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
                        }`}>
                        {comment.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-semibold ${isOfficialReply ? 'text-indigo-900' : 'text-gray-900'}`}>
                                {comment.userId?.name || 'Unknown User'}
                            </span>
                            <RoleBadge role={comment.role} />
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {timeAgo(comment.createdAt)}
                            </span>
                        </div>

                        <p className={`mt-1.5 text-sm leading-relaxed ${isOfficialReply ? 'text-indigo-800' : 'text-gray-700'}`}>
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
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
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
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-orange-100 to-rose-100 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Discussion</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
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
                                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none transition-all"
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
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                        <Lock className="w-5 h-5 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Login</Link> to join the discussion
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
    { key: '0-10', label: '0–10%', color: 'from-red-500 to-rose-400', bgLight: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200', emoji: '😟' },
    { key: '10-50', label: '10–50%', color: 'from-amber-500 to-orange-400', bgLight: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200', emoji: '🤔' },
    { key: '50-80', label: '50–80%', color: 'from-blue-500 to-cyan-400', bgLight: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', emoji: '👍' },
    { key: '80-100', label: '80–100%', color: 'from-emerald-500 to-green-400', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', emoji: '🚀' },
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
            toast.error('Please login to rate this template', { icon: '🔒' });
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
                    { icon: '⭐' }
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
            <motion.div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" {...staggerItem}>
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
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            {...staggerItem}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Effectiveness Rating</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{totalRatings} rating{totalRatings !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                {/* Average Score Badge */}
                {averageScore !== null && averageScore !== undefined && (
                    <motion.div
                        className="mb-5 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-semibold text-indigo-800">Average Effectiveness</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xl font-extrabold text-indigo-700">{averageScore}%</span>
                            </div>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-2 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
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
                                    ? `${range.borderColor} ${range.bgLight} ring-2 ring-offset-1 ${range.borderColor.replace('border-', 'ring-')}`
                                    : isLoggedIn
                                        ? 'border-gray-150 hover:border-gray-300 bg-gray-50/40 hover:bg-gray-50'
                                        : 'border-gray-100 bg-gray-50/30 cursor-default'
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
                                        : 'border-gray-300'
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

                                    {/* Label + Emoji */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-base">{range.emoji}</span>
                                        <span className={`text-sm font-semibold ${isSelected ? range.textColor : 'text-gray-700'
                                            }`}>
                                            {range.label}
                                        </span>
                                    </div>

                                    {/* Count + Bar */}
                                    <div className="flex-1 flex items-center gap-2 ml-auto">
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full rounded-full bg-gradient-to-r ${range.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.06 }}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium w-8 text-right tabular-nums ${isSelected ? range.textColor : 'text-gray-400'
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
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                        <p className="text-xs text-gray-500">
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">Login</Link> to rate this template
                        </p>
                    </div>
                )}

                {/* Confirmation for logged-in user */}
                {isLoggedIn && selectedRange && (
                    <motion.div
                        className="mt-4 flex items-center gap-2 text-xs text-gray-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Your rating: <strong className="text-gray-700">{RATING_RANGES.find(r => r.key === selectedRange)?.label}</strong></span>
                        <span className="text-gray-400">· Tap another to change</span>
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
            toast.error('Please login to upvote', { icon: '🔒' });
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
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100'
                : isLoggedIn
                    ? 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50'
                    : 'bg-gray-50 text-gray-400 border-gray-150 cursor-default'
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
                <motion.div
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-pulse" />
                        <div className="absolute inset-0 w-16 h-16 rounded-2xl border-4 border-indigo-200 animate-spin border-t-transparent" />
                    </div>
                    <p className="text-gray-500 font-medium">Loading template...</p>
                </motion.div>
            </div>
        );
    }

    // ── Error State ──
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 text-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 max-w-md"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Template Not Found</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
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
        <div className="bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 min-h-screen pb-20">
            {/* ── Hero Header ── */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-3xl" />
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
                                {template.tone && (
                                    <span className="px-3 py-1 text-xs font-medium bg-amber-400/20 text-amber-100 rounded-full backdrop-blur-sm border border-amber-400/20">
                                        🎭 {template.tone}
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
                                {/* Upvote in header */}
                                <UpvoteButton templateId={id} isLoggedIn={isLoggedIn} userInfo={userInfo} />
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
                            {/* Prompt Section */}
                            <PromptSection
                                template={template}
                                userValues={userValues}
                                isLoggedIn={isLoggedIn}
                            />

                            {/* Variables Section */}
                            <VariablesSection
                                variables={template.variables}
                                userValues={userValues}
                                setUserValues={setUserValues}
                                isLoggedIn={isLoggedIn}
                            />

                            {/* Sample Output Images */}
                            <SampleOutputSection images={template.sampleOutput} />

                            {/* Comments Section */}
                            <CommentsSection
                                templateId={id}
                                isLoggedIn={isLoggedIn}
                                userInfo={userInfo}
                            />
                        </div>

                        {/* ── Right Sidebar (1/3) ── */}
                        <div className="space-y-6">
                            {/* Effectiveness Rating */}
                            <EffectivenessRatingSection
                                templateId={id}
                                isLoggedIn={isLoggedIn}
                                userInfo={userInfo}
                            />

                            {/* Quick Info Card */}
                            <motion.div
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6"
                                {...staggerItem}
                            >
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl">
                                            <Sparkles className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Template Info</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Output Format */}
                                        {template.outputFormat && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Output Format</span>
                                                <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                    {template.outputFormat}
                                                </span>
                                            </div>
                                        )}

                                        {/* Tone */}
                                        {template.tone && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Tone</span>
                                                <span className="text-sm font-semibold text-gray-900 bg-amber-50 px-2.5 py-1 rounded-lg text-amber-700">
                                                    {template.tone}
                                                </span>
                                            </div>
                                        )}

                                        {/* Variables Count */}
                                        {template.variables?.length > 0 && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">Variables</span>
                                                <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                    {template.variables.length} editable
                                                </span>
                                            </div>
                                        )}

                                        {/* Status */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Status</span>
                                            <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${template.status === 'Approved'
                                                ? 'text-emerald-700 bg-emerald-50'
                                                : template.status === 'Pending'
                                                    ? 'text-amber-700 bg-amber-50'
                                                    : 'text-gray-700 bg-gray-100'
                                                }`}>
                                                {template.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-5 border-t border-gray-100">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                if (!isLoggedIn) {
                                                    toast.error('Please login to copy prompts', { icon: '🔒' });
                                                    return;
                                                }
                                                document.getElementById('copy-prompt-btn')?.click();
                                            }}
                                            className={`w-full py-3.5 px-4 font-bold rounded-xl transition-all duration-200 ${isLoggedIn
                                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
                                </div>

                                {/* Use Case */}
                                {template.useCase && (
                                    <div className="border-t border-gray-100 p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Layers className="w-4 h-4 text-gray-400" />
                                            <h4 className="text-sm font-bold text-gray-900">Use Case</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{template.useCase}</p>
                                    </div>
                                )}

                                {/* Structural Instruction */}
                                {template.structuralInstruction && (
                                    <div className="border-t border-gray-100 p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <h4 className="text-sm font-bold text-gray-900">Structural Instruction</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{template.structuralInstruction}</p>
                                    </div>
                                )}

                                {/* Repurposing Ideas */}
                                {template.repurposingIdeas && (
                                    <div className="border-t border-gray-100 p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles className="w-4 h-4 text-gray-400" />
                                            <h4 className="text-sm font-bold text-gray-900">Repurposing Ideas</h4>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{template.repurposingIdeas}</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </main>
            )}
        </div>
    );
}
