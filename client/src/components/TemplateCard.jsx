import React from 'react';
import { Sparkles, ArrowRight, Star, ShieldCheck } from 'lucide-react';

export default function TemplateCard({ template }) {
    return (
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
                        {template.industry}
                    </span>
                    {template.expertBadge && (
                        <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-medium" title="Verified Expert Template">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Expert
                        </div>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
                    {template.title}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">
                    {template.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                        <span className={`w-2 h-2 rounded-full mr-2 ${template.effectiveness >= 80 ? 'bg-emerald-500' :
                                template.effectiveness >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}></span>
                        {template.effectiveness}% Effective
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center group/btn">
                        View
                        <ArrowRight className="w-4 h-4 ml-1 transform group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
