import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, ShieldCheck, Share2, Heart, Clock } from 'lucide-react';

export default function TemplateDetails() {
    const { id } = useParams();
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                // Assuming standard API structure
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${id}`);
                if (!response.ok) {
                    throw new Error('Template not found');
                }
                const data = await response.json();
                setTemplate(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTemplate();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Template not found</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    &larr; Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Templates
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {template && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="px-3 py-1 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-full">
                                        {template.industry?.name || 'General'}
                                    </span>
                                    {template.category && (
                                        <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded-full">
                                            {template.category.name}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    {template.title}
                                </h1>

                                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                    {template.description}
                                </p>

                                <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-indigo-100 p-2 rounded-full">
                                            <span className="font-bold text-indigo-700">{template.user?.name?.charAt(0) || 'U'}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Created by</p>
                                            <p className="text-sm text-gray-500">{template.user?.name || 'Unknown Author'}</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Last Updated</p>
                                        <p className="text-sm text-gray-500">{new Date(template.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Prompt Content Preview (Locked/Unlocked state would go here) */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Prompt Preview</h2>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm text-gray-600 overflow-x-auto">
                                    {template.basePromptText || "No preview available."}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 text-amber-400 fill-current" />
                                        <span className="font-bold text-xl text-gray-900">4.8</span>
                                        <span className="text-sm text-gray-500">(12 reviews)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Heart className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-indigo-500 transition-colors">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 mb-4">
                                    Use This Template
                                </button>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Access</span>
                                        <span className="font-medium text-gray-900">Free</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Format</span>
                                        <span className="font-medium text-gray-900">{template.outputFormat || 'Text'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
