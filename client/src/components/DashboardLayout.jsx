import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Menu, LogOut, LayoutDashboard, FileText, Users, Settings,
    FileCheck, Briefcase, Tags, MessageSquare, BarChart2, User,
    BadgeCheck, Braces
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const DashboardLayout = () => {
    const { userInfo, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
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
            { icon: FileCheck, label: 'Templates', path: '/dashboard/templates' },
            { icon: Braces, label: 'Template Variables', path: '/dashboard/variables' },
            { icon: Briefcase, label: 'Industries', path: '/dashboard/industries' },
            { icon: Tags, label: 'Categories', path: '/dashboard/categories' },
            { icon: MessageSquare, label: 'Moderate Comments', path: '/dashboard/comments' },
            { icon: BarChart2, label: 'Analytics', path: '/dashboard/analytics' },
            { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
        ] : []),
        ...(userInfo.role === 'Expert' ? [
            { icon: FileText, label: 'Template Management', path: '/dashboard/models' }
        ] : [])
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-20 overflow-y-auto`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
                    {isSidebarOpen ? (
                        <span className="text-xl font-bold text-indigo-600">AdminPanel</span>
                    ) : (
                        <span className="text-xl font-bold text-indigo-600 mx-auto">A</span>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <Link
                            key={index} // key={item.path} might duplicate if paths are same, index is safer if duplicate paths exist temporarily
                            to={item.path}
                            className={`flex items-center px-3 py-2.5 rounded-lg transition-colors group ${location.pathname === item.path
                                ? 'bg-indigo-50 text-indigo-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} className={`${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            {isSidebarOpen && <span className="ml-3 truncate">{item.label}</span>}
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200 relative">
                                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={16} />}
                                {userInfo.isVerifiedExpert && (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                                        <BadgeCheck size={14} className="text-blue-600 fill-blue-50" />
                                    </div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{userInfo.role}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className={`flex items-center w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${!isSidebarOpen && 'justify-center'}`}
                        title="Sign out"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="ml-3">Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <div className="p-8 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
