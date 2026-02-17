import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Activity, TrendingUp } from 'lucide-react';

const DashboardOverview = () => {
    const { userInfo } = useAuth();

    // In a real app, fetch stats from API
    const stats = [
        { label: 'Total Sales', value: '$12,450', change: '+12%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Active Users', value: '1,234', change: '+5%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { label: 'Pending Requests', value: '8', change: '-2', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Server Status', value: '99.9%', change: 'Stable', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {userInfo?.name}!</p>
                </div>
                <div className="text-sm text-gray-400">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Content Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        Chart placeholder
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Actions</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New expert request submitted</p>
                                    <p className="text-xs text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
