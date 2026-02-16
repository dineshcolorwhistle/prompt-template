import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-indigo-600 rounded text-center text-white text-xs font-bold flex items-center justify-center">P</div>
                                <span className="text-lg font-bold text-gray-900">PromptMarket</span>
                            </div>
                            <p className="text-gray-500 text-sm">
                                The industry-standard marketplace for high-performance AI prompt templates.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-indigo-600">Browse</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Categories</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Experts</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Community</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-indigo-600">Guidelines</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Become an Expert</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Discussion</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-500">
                                <li><a href="#" className="hover:text-indigo-600">Terms</a></li>
                                <li><a href="#" className="hover:text-indigo-600">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} PromptMarket. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
