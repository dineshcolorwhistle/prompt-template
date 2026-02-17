import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, LayoutDashboard, ChevronDown, CheckCircle, BadgeCheck } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import RequestExpertModal from './RequestExpertModal';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const { userInfo, logout } = useAuth();
    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
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

                            {userInfo ? (
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 focus:outline-none"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 relative">
                                            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={16} />}
                                            {userInfo.isVerifiedExpert && (
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                                                    <BadgeCheck size={14} className="text-blue-600 fill-blue-50" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium text-sm max-w-[100px] truncate">{userInfo.name}</span>
                                        <ChevronDown size={16} className={`transform transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                            <div className="px-4 py-2 border-b border-gray-50">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{userInfo.email}</p>
                                                <p className="text-xs font-semibold text-indigo-600 mt-1 capitalize">{userInfo.role}</p>
                                            </div>

                                            {['Admin', 'Expert'].includes(userInfo.role) ? (
                                                <Link
                                                    to="/dashboard"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 flex items-center"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <LayoutDashboard size={16} className="mr-2" />
                                                    Dashboard
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        setIsRequestModalOpen(true);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 flex items-center"
                                                >
                                                    <CheckCircle size={16} className="mr-2" />
                                                    Become an Expert
                                                </button>
                                            )}

                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 flex items-center"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                <User size={16} className="mr-2" />
                                                Profile
                                            </Link>

                                            <div className="border-t border-gray-50 mt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                                >
                                                    <LogOut size={16} className="mr-2" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Log in</Link>
                                    <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                                        Sign up
                                    </Link>
                                </>
                            )}
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

                            {userInfo ? (
                                <>
                                    <div className="flex items-center space-x-3 py-2 border-b border-gray-50 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 relative">
                                            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={20} />}
                                            {userInfo.isVerifiedExpert && (
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                                                    <BadgeCheck size={16} className="text-blue-600 fill-blue-50" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{userInfo.name}</p>
                                            <p className="text-xs text-gray-500">{userInfo.email}</p>
                                        </div>
                                    </div>

                                    {['Admin', 'Expert'].includes(userInfo.role) ? (
                                        <Link to="/dashboard" className="text-gray-600 font-medium py-2 flex items-center hover:text-indigo-600">
                                            <LayoutDashboard size={18} className="mr-2" />
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => setIsRequestModalOpen(true)}
                                            className="text-gray-600 font-medium py-2 flex items-center hover:text-indigo-600 w-full text-left"
                                        >
                                            <CheckCircle size={18} className="mr-2" />
                                            Become an Expert
                                        </button>
                                    )}

                                    <Link to="/profile" className="text-gray-600 font-medium py-2 flex items-center hover:text-indigo-600">
                                        <User size={18} className="mr-2" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-600 font-medium py-2 text-left flex items-center hover:bg-red-50"
                                    >
                                        <LogOut size={18} className="mr-2" />
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 font-medium py-2">Log in</Link>
                                    <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-center font-medium">
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            <RequestExpertModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
        </>
    );
}
