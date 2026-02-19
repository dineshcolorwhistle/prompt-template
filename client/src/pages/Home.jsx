import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import Pagination from '../components/Pagination';
import { motion } from 'framer-motion';
import { listVariants, itemVariants } from '../animations';
import { Search } from 'lucide-react';

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Get params from URL
    const page = parseInt(searchParams.get('page') || '1', 10);
    const industry = searchParams.get('industry') || '';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    page: page.toString(),
                    limit: '12',
                    status: 'Approved' // Only show approved templates
                });

                if (industry) query.append('industry', industry);
                if (category) query.append('category', category);
                if (search) query.append('search', search); // Backend should support 'search' or 'title'

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates?${query.toString()}`);

                if (response.ok) {
                    const data = await response.json();
                    if (data.result) {
                        setTemplates(data.result);
                        setTotalPages(data.pages);
                        setTotalItems(data.total);
                    } else {
                        setTemplates(Array.isArray(data) ? data : []);
                        setTotalPages(1); // Fallback
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
    }, [page, industry, category, search]);

    const handlePageChange = (newPage) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="pb-16 min-h-screen bg-gray-50/30">
            {/* Header / Title Section (Dynamic based on selection) */}
            <div className="bg-white border-b border-gray-100 py-4 mb-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {search ? `Results for "${search}"` :
                            category ? 'Category Templates' :
                                industry ? 'Industry Templates' :
                                    'Latest Templates'}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        {totalItems} templates available
                    </p>
                </div>
            </div>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading templates...</p>
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
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No templates found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            We couldn't find any templates matching your criteria. Try adjusting your filters or search term.
                        </p>
                        {(industry || category || search) && (
                            <button
                                onClick={() => setSearchParams({})}
                                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
