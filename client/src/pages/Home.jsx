import React, { useState, useEffect } from 'react';
import TemplateCard from '../components/TemplateCard';
import Pagination from '../components/Pagination';
import { Sparkles, TrendingUp, Grid, Briefcase } from 'lucide-react';

const MOCK_TEMPLATES = [
    {
        id: 1,
        title: "SEO-Optimized Blog Post Generator",
        description: "Generate comprehensive, SEO-friendly blog posts with proper H-tag structure and keyword integration.",
        industry: "Marketing",
        category: "Content Writing",
        effectiveness: 92,
        expertBadge: true,
    },
    {
        id: 2,
        title: "React Component Unit Test Suite",
        description: "Create robust Jest/React Testing Library test cases for functional components including edge cases.",
        industry: "Development",
        category: "Testing",
        effectiveness: 88,
        expertBadge: true,
    },
    {
        id: 3,
        title: "Strategic Business Proposal Outline",
        description: "Layout a persuasive business proposal structure for B2B services, including executive summary and pricing models.",
        industry: "Business",
        category: "Sales",
        effectiveness: 76,
        expertBadge: false,
    },
    {
        id: 4,
        title: "Python Data Analysis Script",
        description: "Generate Python pandas scripts for cleaning and analyzing CSV datasets with visualization recommendations.",
        industry: "Data Science",
        category: "Coding",
        effectiveness: 95,
        expertBadge: true,
    },
    {
        id: 5,
        title: "Email Sequence for Cold Outreach",
        description: "A 5-part email sequence designed to warm up leads and convert them into scheduled calls.",
        industry: "Sales",
        category: "Email Marketing",
        effectiveness: 65,
        expertBadge: false,
    },
    {
        id: 6,
        title: "HR Performance Review Feedback",
        description: "Constructive feedback generator for employee performance reviews based on core competencies.",
        industry: "Human Resources",
        category: "Management",
        effectiveness: 82,
        expertBadge: true,
    }
];

export default function Home() {
    const [industries, setIndustries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        fetchIndustries();
    }, [page]);

    const fetchIndustries = async () => {
        setLoading(true);
        try {
            // Fetch active industries only
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/industries?page=${page}&limit=12&status=active`);
            if (response.ok) {
                const data = await response.json();
                if (data.result) {
                    setIndustries(data.result);
                    setTotalPages(data.pages);
                    setTotalItems(data.total);
                } else {
                    setIndustries(Array.isArray(data) ? data : []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch industries:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-16">
            {/* Hero Section */}
            <section className="bg-white border-b border-gray-100 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8 animate-fade-in-up">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Over 5,000+ Industry-Tested Prompt Templates
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                        Master AI with <span className="text-indigo-600">Proven Prompts</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
                        A curated marketplace for high-quality, pre-tested prompt templates. Stop guessing and start generating production-ready outputs.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5">
                            Browse Templates
                        </button>
                        <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all hover:border-gray-300">
                            Become an Expert
                        </button>
                    </div>
                </div>
            </section>

            {/* Featured Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                            <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
                            Trending Templates
                        </h2>
                        <p className="text-gray-500">Most popular templates widely used by professionals this week.</p>
                    </div>
                    <a href="#" className="hidden sm:flex items-center text-indigo-600 font-medium hover:text-indigo-700">
                        View all <Grid className="w-4 h-4 ml-1" />
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {MOCK_TEMPLATES.map(template => (
                        <TemplateCard key={template.id} template={template} />
                    ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <button className="text-indigo-600 font-medium hover:text-indigo-700">View all templates</button>
                </div>
            </section>

            {/* Categories/Industries */}
            <section className="bg-gray-50/50 py-16 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse by Industry</h2>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : industries.length > 0 ? (
                        <>
                            <div className="flex flex-wrap justify-center gap-4">
                                {industries.map(ind => (
                                    <button key={ind._id} className="px-6 py-3 bg-white rounded-lg border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all font-medium flex items-center gap-2">
                                        <Briefcase size={16} className="text-gray-400 group-hover:text-indigo-500" />
                                        {ind.name}
                                    </button>
                                ))}
                            </div>

                            <div className="max-w-2xl mx-auto">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    totalItems={totalItems}
                                    itemsPerPage={12}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            No industries found.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
