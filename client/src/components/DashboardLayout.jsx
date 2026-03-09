import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../animations';
import {
    Menu, LogOut, LayoutDashboard, FileText, Users, Settings,
    FileCheck, Briefcase, Tags, MessageSquare, BarChart2, User,
    BadgeCheck, Braces, Bot, Sun, Moon
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';

const DashboardLayout = () => {
    const { userInfo, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [theme, setTheme] = useDarkMode();
    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
    // Determine active item based on path
    const location = useLocation();
    const navigate = useNavigate();

    // Protect route: Redirect if not Expert/Admin
    useEffect(() => {
        if (userInfo && userInfo.role === 'User') {
            navigate('/');
        }
    }, [userInfo, navigate]);

    if (!userInfo) return null;

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        ...(userInfo.role === 'Admin' ? [
            { icon: Users, label: 'Manage Users', path: '/dashboard/users' },
            { icon: Users, label: 'Expert Requests', path: '/dashboard/requests' },


            { icon: Bot, label: 'LLMs', path: '/dashboard/llms' },
            { icon: Briefcase, label: 'Industries', path: '/dashboard/industries' },
            { icon: Tags, label: 'Categories', path: '/dashboard/categories' },
            { icon: FileCheck, label: 'Templates', path: '/dashboard/templates' },
            { icon: MessageSquare, label: 'Moderate Comments', path: '/dashboard/comments' },
            { icon: BarChart2, label: 'Analytics', path: '/dashboard/analytics' },
            { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
        ] : []),
        ...(userInfo.role === 'Expert' ? [
            { icon: FileText, label: 'Template Management', path: '/dashboard/models' }
        ] : [])
    ];

    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-950 flex overflow-hidden transition-colors duration-300">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col fixed h-full z-20`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    {isSidebarOpen ? (
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">AdminPanel</span>
                    ) : (
                        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mx-auto">A</span>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors">
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${location.pathname === item.path
                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <item.icon size={20} className={`${location.pathname === item.path ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                            {isSidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 space-y-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`flex items-center w-full px-3 py-2 text-left text-sm font-medium rounded-lg transition-all duration-200 group
                            text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200
                            ${!isSidebarOpen && 'justify-center'}`}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <div className="relative w-5 h-5 flex-shrink-0">
                            <Sun
                                size={20}
                                className={`absolute inset-0 transform transition-all duration-300 ${theme === 'dark'
                                        ? 'rotate-0 scale-100 opacity-100 text-amber-400'
                                        : 'rotate-90 scale-0 opacity-0'
                                    }`}
                            />
                            <Moon
                                size={20}
                                className={`absolute inset-0 transform transition-all duration-300 ${theme === 'dark'
                                        ? '-rotate-90 scale-0 opacity-0'
                                        : 'rotate-0 scale-100 opacity-100 text-gray-500'
                                    }`}
                            />
                        </div>
                        {isSidebarOpen && (
                            <span className="ml-3">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        )}
                    </button>

                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 mb-1 px-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/30 relative">
                                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={16} />}
                                {userInfo.isVerifiedExpert && (
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full">
                                        <BadgeCheck size={14} className="text-blue-600 fill-blue-50" />
                                    </div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userInfo.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                                    {userInfo.role === 'Expert'
                                        ? (userInfo.isVerifiedExpert ? 'Verified Expert' : 'Expert (Provisional)')
                                        : userInfo.role}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className={`flex items-center w-full px-3 py-2 text-left text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ${!isSidebarOpen && 'justify-center'}`}
                        title="Sign out"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="ml-3">Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content — sole scroll container */}
            <main className={`flex-1 transition-all duration-300 overflow-y-auto ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-8 max-w-6xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            variants={pageVariants}
                            initial="initial"
                            animate="in"
                            exit="out"
                            transition={pageTransition}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
