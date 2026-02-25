import React from 'react';
import { Sparkles, ArrowRight, Star, ShieldCheck, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TemplateCard({ template }) {
    // Mock rating based on title length or random to simulate data
    const rating = (4.2 + (template._id.charCodeAt(template._id.length - 1) % 8) / 10).toFixed(1);

    return (
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
            <div className="p-6 flex-1 flex flex-col">
                {/* LLM Badge + Industry + Category */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
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
                </div>

                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-3 line-clamp-2">
                    {template.title}
                </h3>

                <p className="text-sm text-gray-500 mb-6 line-clamp-3 flex-1 leading-relaxed">
                    {template.description}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-gray-50 mt-auto">
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-sm font-bold text-gray-700">{rating}</span>
                        <span className="text-xs text-gray-400">(15)</span>
                    </div>

                    <Link
                        to={`/template/${template._id}`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold text-sm group/btn"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1 transform group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
