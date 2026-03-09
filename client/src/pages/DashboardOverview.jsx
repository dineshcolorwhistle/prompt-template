import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Activity, TrendingUp, CheckCircle, Clock, Copy, Calendar, Tag, Briefcase, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { listVariants, itemVariants } from '../animations';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const STATUS_COLORS = {
    Approved: '#10b981',
    Pending: '#f59e0b',
    Draft: '#6b7280',
    Rejected: '#ef4444'
};

const CHART_COLORS = ['#10b981', '#f59e0b', '#6b7280', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-medium">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardOverview = () => {
    const { userInfo } = useAuth();

    const [stats, setStats] = useState([]);
    const [recentActions, setRecentActions] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userInfo?.token) return;

        const controller = new AbortController();
        const fetchStats = async () => {
            try {
                if (userInfo.role === 'Expert') {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/stats`, {
                        headers: { Authorization: `Bearer ${userInfo.token}` },
                        signal: controller.signal
                    });
                    const data = await response.json();

                    setStats([
                        { label: 'Total Templates', value: data.total || 0, change: 'All time', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-500/20', gradient: 'from-indigo-500 to-indigo-600' },
                        { label: 'Approved Templates', value: data.approved || 0, change: 'Live', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20', gradient: 'from-emerald-500 to-emerald-600' },
                        { label: 'Pending Templates', value: data.pending || 0, change: 'Awaiting', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/20', gradient: 'from-amber-500 to-amber-600' },
                        { label: 'Copy Prompt Count', value: data.copyPromptCount || 0, change: 'Total', icon: Copy, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20', gradient: 'from-blue-500 to-blue-600' },
                    ]);

                    // Set recent templates for expert
                    if (data.recentTemplates) {
                        setRecentActions(data.recentTemplates);
                    }
                } else {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/admin/dashboard`, {
                        headers: { Authorization: `Bearer ${userInfo.token}` },
                        signal: controller.signal
                    });
                    const data = await response.json();

                    if (data.stats) {
                        setStats([
                            { label: 'Active Users', value: data.stats.activeUsers || 0, change: 'Total', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-500/20', gradient: 'from-indigo-500 to-indigo-600' },
                            { label: 'Total Templates', value: data.stats.templates || 0, change: 'All time', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/20', gradient: 'from-emerald-500 to-emerald-600' },
                            { label: 'Pending Approval', value: data.stats.pendingTemplates || 0, change: 'Waiting', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-500/20', gradient: 'from-amber-500 to-amber-600' },
                            { label: 'Prompt Copies', value: data.stats.promptCopied || 0, change: 'Total', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/20', gradient: 'from-blue-500 to-blue-600' },
                        ]);
                    }
                    if (data.chartData) {
                        setChartData(data.chartData);
                    }
                    if (data.recentActions) {
                        setRecentActions(data.recentActions);
                    }
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error("Failed to fetch dashboard stats", error);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchStats();
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo?.role, userInfo?.token]);

    const renderExpertRecentActions = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
        >
            <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/15">
                    <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recently Created Templates</h3>
            </div>
            <div className="space-y-3">
                {recentActions.length > 0 ? recentActions.map((template, i) => (
                    <motion.div
                        key={template._id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer border border-gray-50 dark:border-gray-800 hover:border-gray-100 dark:hover:border-gray-700"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                            <FileText size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{template.title}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                                {template.category?.name && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Tag size={12} />
                                        {template.category.name}
                                    </span>
                                )}
                                {template.industry?.name && (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Briefcase size={12} />
                                        {template.industry.name}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${template.status === 'Approved' ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                                    template.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400' :
                                        template.status === 'Draft' ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                                            'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400'
                                    }`}>
                                    {template.status === 'Approved' && <CheckCircle size={10} />}
                                    {template.status === 'Pending' && <Clock size={10} />}
                                    {template.status}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                                    <Calendar size={10} />
                                    {new Date(template.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                            <FileText size={20} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">No templates created yet</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your recent templates will appear here</p>
                    </div>
                )}
            </div>
        </motion.div>
    );

    const renderAdminActivityOverview = () => {
        if (!chartData) return null;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Trends Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/15">
                                <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Template Trends</h3>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Last 6 months</span>
                    </div>
                    {chartData.monthlyTrends && chartData.monthlyTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData.monthlyTrends} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="total" name="Total" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorTotal)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                                <Area type="monotone" dataKey="approved" name="Approved" stroke="#10b981" strokeWidth={2.5} fill="url(#colorApproved)" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[280px] flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp size={20} className="text-gray-400 dark:text-gray-500" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">No trend data available yet</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Status Distribution Donut Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/15">
                            <Activity size={18} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Template Status</h3>
                    </div>
                    {chartData.statusDistribution && chartData.statusDistribution.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={chartData.statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {chartData.statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-3 justify-center mt-2">
                                {chartData.statusDistribution.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length] }} />
                                        <span className="text-xs text-gray-600 dark:text-gray-400">{entry.name} ({entry.value})</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">No status data available</p>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    };

    const renderAdminRecentActions = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Template Updates */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
            >
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/15">
                        <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Template Updates</h3>
                </div>
                <div className="space-y-3">
                    {recentActions.length > 0 ? recentActions.map((action, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${action.status === 'Approved' ? 'bg-emerald-500' :
                                    action.status === 'Pending' ? 'bg-amber-500' :
                                        'bg-gray-400'
                                    }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {action.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    By: {action.user?.name || 'Unknown'} • <span className={`font-medium ${action.status === 'Approved' ? 'text-emerald-600 dark:text-emerald-400' :
                                        action.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' :
                                            'text-gray-500 dark:text-gray-400'
                                        }`}>{action.status}</span>
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                    {new Date(action.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    )) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent template updates</p>
                    )}
                </div>
            </motion.div>

            {/* Recent User Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
            >
                <div className="flex items-center gap-2 mb-5">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/15">
                        <UserPlus size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent User Registrations</h3>
                </div>
                <div className="space-y-3">
                    {chartData?.recentUsers && chartData.recentUsers.length > 0 ? chartData.recentUsers.map((user, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.role === 'Admin' ? 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400' :
                                    user.role === 'Expert' ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400' :
                                        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}>{user.role}</span>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </motion.div>
                    )) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent user registrations</p>
                    )}
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back, {userInfo?.name}!</p>
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={listVariants}
                initial="hidden"
                animate="show"
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                    >
                        {/* Subtle gradient accent bar at top */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-80`} />
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</h3>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">{stat.value.toLocaleString()}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Role-specific content */}
            {userInfo?.role === 'Expert' && renderExpertRecentActions()}

            {userInfo?.role === 'Admin' && (
                <>
                    {renderAdminActivityOverview()}
                    {renderAdminRecentActions()}
                </>
            )}
        </div>
    );
};

export default DashboardOverview;
