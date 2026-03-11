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

            {/* Minimal Footer */}
            <footer className="bg-[#fafafa] dark:bg-[#0b0f19] py-8 border-t border-gray-100 dark:border-gray-800 transition-colors duration-200 flex flex-col items-center justify-center gap-4">
                <Link to="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
                    <img src="/pm-logo.png" alt="PromptMarket Logo" className="h-8 w-auto object-contain dark:hidden" />
                    <img src="/pm-white-logo.png" alt="PromptMarket Logo" className="h-8 w-auto object-contain hidden dark:block" />
                </Link>
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                        &copy; {new Date().getFullYear()} PromptMarket. Discover the best AI prompt templates.
                    </p>
                </div>
            </footer>
        </div>
    );
}
