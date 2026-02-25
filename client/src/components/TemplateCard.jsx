import React from 'react';
import { Sparkles, ArrowRight, Star, ShieldCheck, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TemplateCard({ template }) {
    // Convert effectiveness score (0-100) to a 5-star rating
    // averageScore is the weighted average of effectiveness ratings (0–100 scale)
    // Default to 5.0 stars when no ratings exist
    const ratingInfo = template.ratingInfo || { averageScore: null, totalRatings: 0 };
    const starRating = ratingInfo.averageScore !== null
        ? (ratingInfo.averageScore / 20).toFixed(1) // 100% → 5.0 stars, 50% → 2.5 stars
        : '5.0'; // Default 5-star rating when no ratings
    const totalRatings = ratingInfo.totalRatings || 0;

    // Calculate how many stars to fill (for the visual display)
    const starValue = parseFloat(starRating);
    const fullStars = Math.floor(starValue);
    const hasHalfStar = starValue - fullStars >= 0.3; // show half star at 0.3+
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

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
                        {/* Render star icons */}
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
                        <span className="text-xs text-gray-400">
                            ({totalRatings}{totalRatings === 1 ? ' rating' : ' ratings'})
                        </span>
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
