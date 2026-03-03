import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200">
            <Navbar />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-8 mt-auto transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-500 rounded text-center text-white text-xs font-bold flex items-center justify-center">P</div>
                        <span className="font-bold text-gray-900 dark:text-white">PromptMarket</span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Support</a>
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        &copy; {new Date().getFullYear()} Inc.
                    </p>
                </div>
            </footer>
        </div>
    );
}
