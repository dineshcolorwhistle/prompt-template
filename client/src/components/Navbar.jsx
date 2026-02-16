import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, User } from 'lucide-react';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            P
                        </div>
                        <span className="text-xl font-bold text-gray-900 hidden sm:block">PromptMarket</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Browse</Link>
                        <Link to="/categories" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Categories</Link>
                        <Link to="/experts" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Experts</Link>
                    </div>

                    {/* Search & Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64 transition-all"
                            />
                        </div>

                        <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Log in</Link>
                        <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                            Sign up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-4 md:hidden shadow-lg animate-in slide-in-from-top-2">
                    <div className="flex flex-col space-y-4">
                        <Link to="/" className="text-gray-600 font-medium py-2">Browse</Link>
                        <Link to="/categories" className="text-gray-600 font-medium py-2">Categories</Link>
                        <Link to="/experts" className="text-gray-600 font-medium py-2">Experts</Link>
                        <hr className="border-gray-100" />
                        <Link to="/login" className="text-gray-600 font-medium py-2">Log in</Link>
                        <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-center font-medium">
                            Sign up
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
