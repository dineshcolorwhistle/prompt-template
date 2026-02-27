import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Send, Briefcase, Clock, Link2, FileText, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RequestExpertModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        primaryIndustry: '',
        yearsOfExperience: '',
        portfolioLink: '',
        samplePrompt: '',
        methodologyExplanation: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { userInfo } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/expert-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Request submitted successfully! We will review it shortly.');
                setFormData({
                    primaryIndustry: '',
                    yearsOfExperience: '',
                    portfolioLink: '',
                    samplePrompt: '',
                    methodologyExplanation: '',
                });
                setTimeout(() => {
                    onClose();
                    setMessage('');
                }, 2000);
            } else {
                setMessage(data.message || 'Something went wrong');
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-sm";

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Become an Expert</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Tell us about your expertise and experience</p>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/60">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Form Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {message && (
                                <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                    {message}
                                </div>
                            )}

                            {/* Info Banner */}
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-5">
                                <p className="text-xs text-indigo-700 leading-relaxed">
                                    <strong>How it works:</strong> Upon approval, you'll become a <strong>Provisional Expert</strong> with full template creation access.
                                    Once you achieve 3+ approved templates, 50+ ratings, and ≥70% average effectiveness, you'll be automatically upgraded to <strong>Verified Expert</strong> with a verification badge.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} id="expert-request-form" className="space-y-4">
                                {/* Row 1: Industry + Experience */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                            <Briefcase size={14} className="text-gray-400" />
                                            Primary Industry <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="primaryIndustry"
                                            value={formData.primaryIndustry}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="e.g. Healthcare, Finance, Marketing"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                            <Clock size={14} className="text-gray-400" />
                                            Years of Experience <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="yearsOfExperience"
                                            value={formData.yearsOfExperience}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="e.g. 5"
                                            min="0"
                                            max="50"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Portfolio Link */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                        <Link2 size={14} className="text-gray-400" />
                                        Portfolio Link <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        name="portfolioLink"
                                        value={formData.portfolioLink}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="https://your-portfolio.com or LinkedIn profile"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Share your website, LinkedIn, GitHub, or any relevant online presence</p>
                                </div>

                                {/* Sample Prompt */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                        <FileText size={14} className="text-gray-400" />
                                        Sample Prompt <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="samplePrompt"
                                        value={formData.samplePrompt}
                                        onChange={handleChange}
                                        className={`${inputClass} min-h-[100px] resize-none`}
                                        placeholder="Write a sample prompt that demonstrates your prompt engineering skills..."
                                        required
                                    ></textarea>
                                    <p className="mt-1 text-xs text-gray-400">Show us a real prompt you've crafted – the more detailed, the better</p>
                                </div>

                                {/* Methodology Explanation */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                                        <Lightbulb size={14} className="text-gray-400" />
                                        Methodology Explanation <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="methodologyExplanation"
                                        value={formData.methodologyExplanation}
                                        onChange={handleChange}
                                        className={`${inputClass} min-h-[100px] resize-none`}
                                        placeholder="Explain your approach to prompt engineering. What techniques do you use? How do you iterate and improve prompts?"
                                        required
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        {/* Fixed Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 flex-shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="expert-request-form"
                                disabled={loading}
                                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : (
                                    <>
                                        Submit Application
                                        <Send size={16} className="ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RequestExpertModal;
