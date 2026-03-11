import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { Bot, Mail, ExternalLink, Github, Twitter } from 'lucide-react';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-200">
            <Navbar />
            <main className="flex-1 pt-20">
                {children}
            </main>

            {/* Enhanced Footer */}
            <footer className="bg-gray-900 dark:bg-gray-950 border-t border-gray-800 dark:border-gray-800 text-gray-300 transition-colors duration-200">
                {/* Main Footer */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
                        {/* Brand Column */}
                        <div className="md:col-span-1">
                            <Link to="/" className="flex items-center gap-3 mb-6 group hover:opacity-90 transition-opacity">
                                <img src="/pm-white-logo.png" alt="PromptMarket Logo" className="h-20 sm:h-24 scale-110 origin-left w-auto object-contain" />
                            </Link>
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                The premier marketplace for AI prompt templates. Expert-crafted prompts for every LLM to supercharge your workflow.
                            </p>
                            <div className="flex gap-3">
                                <a href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200" aria-label="Twitter">
                                    <Twitter size={16} />
                                </a>
                                <a href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200" aria-label="GitHub">
                                    <Github size={16} />
                                </a>
                                <a href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200" aria-label="Email">
                                    <Mail size={16} />
                                </a>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Product</h4>
                            <ul className="space-y-3">
                                <li><Link to="/" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Browse Prompts</Link></li>
                                <li><Link to="/#featured" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Featured Templates</Link></li>
                                <li><Link to="/signup" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Create Account</Link></li>
                                <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Pricing</a></li>
                            </ul>
                        </div>

                        {/* Resources Links */}
                        <div>
                            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Resources</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Documentation</a></li>
                                <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">API Reference</a></li>
                                <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Blog</a></li>
                                <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Community</a></li>
                            </ul>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</h4>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Privacy Policy</a></li>
                                <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Terms of Service</a></li>
                                <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Cookie Policy</a></li>
                                <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors duration-200">Contact Support</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-gray-500">
                                &copy; {new Date().getFullYear()} PromptMarket Inc. All rights reserved.
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">

                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
