import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, X, Clock, Trash2, ChevronDown, ChevronUp, ExternalLink, Briefcase, Calendar, Link2, FileText, Lightbulb } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { toast } from 'react-hot-toast';

const ExpertRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const { userInfo } = useAuth();

    // Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        requestId: null
    });

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/expert-requests`, {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                    signal: controller.signal
                });
                if (!response.ok) throw new Error('Failed to fetch requests');
                const data = await response.json();
                setRequests(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    toast.error(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        fetchData();
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/expert-requests/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                setRequests(requests.map(req =>
                    req._id === id ? { ...req, status } : req
                ));
                toast.success(`Request ${status.toLowerCase()} successfully`);
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            console.error('Failed to update status', err);
            toast.error('An error occurred');
        }
    };

    const confirmDelete = (id) => {
        setDeleteModal({
            isOpen: true,
            requestId: id
        });
    };

    const handleDeleteRequest = async () => {
        const id = deleteModal.requestId;
        if (!id) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/expert-requests/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            });

            if (response.ok) {
                setRequests(requests.filter(req => req._id !== id));
                toast.success('Request deleted successfully');
            } else {
                const data = await response.json();
                console.error(data.message);
                toast.error(data.message || 'Failed to delete request');
            }
        } catch (err) {
            console.error('Failed to delete request', err);
            toast.error('An error occurred');
        } finally {
            setDeleteModal({ isOpen: false, requestId: null });
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expert Requests</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                        <Clock size={12} />
                        {requests.filter(r => r.status === 'Pending').length} Pending
                    </span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Industry</th>
                                <th className="px-6 py-4">Experience</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        No pending requests found.
                                    </td>
                                </tr>
                            ) : requests.map((request) => (
                                <React.Fragment key={request._id}>
                                    <tr
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${expandedId === request._id ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                                        onClick={() => toggleExpand(request._id)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs mr-3">
                                                    {request.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{request.user?.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{request.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                {request.primaryIndustry || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {request.yearsOfExperience !== undefined ? `${request.yearsOfExperience} yrs` : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${request.status === 'Approved' ? 'bg-green-100 dark:bg-green-500/15 text-green-800 dark:text-green-400' :
                                                    request.status === 'Rejected' ? 'bg-red-100 dark:bg-red-500/15 text-red-800 dark:text-red-400' :
                                                        'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-800 dark:text-yellow-400'}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => toggleExpand(request._id)}
                                                    className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    {expandedId === request._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                                {request.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(request._id, 'Approved')}
                                                            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(request._id, 'Rejected')}
                                                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => confirmDelete(request._id)}
                                                    className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                                                    title="Delete Request"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Detail Row */}
                                    {expandedId === request._id && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-0">
                                                <div className="py-4 border-t border-indigo-100 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-indigo-500/5 dark:to-purple-500/5 -mx-6 px-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                                                        {/* Portfolio Link */}
                                                        <div className="flex items-start gap-2">
                                                            <Link2 size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Portfolio</p>
                                                                {request.portfolioLink ? (
                                                                    <a
                                                                        href={request.portfolioLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline flex items-center gap-1 break-all"
                                                                    >
                                                                        {request.portfolioLink}
                                                                        <ExternalLink size={12} />
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400 dark:text-gray-500 italic">Not provided</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Industry & Experience Summary */}
                                                        <div className="flex items-start gap-2">
                                                            <Briefcase size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Background</p>
                                                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                    <strong>{request.primaryIndustry || 'N/A'}</strong> · {request.yearsOfExperience !== undefined ? `${request.yearsOfExperience} years experience` : 'Experience not listed'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Sample Prompt */}
                                                        <div className="md:col-span-2 flex items-start gap-2">
                                                            <FileText size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1">
                                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Sample Prompt</p>
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                                                    {request.samplePrompt || <span className="italic text-gray-400 dark:text-gray-500">Not provided</span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Methodology */}
                                                        <div className="md:col-span-2 flex items-start gap-2">
                                                            <Lightbulb size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1">
                                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Methodology</p>
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                                                    {request.methodologyExplanation || <span className="italic text-gray-400 dark:text-gray-500">Not provided</span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Legacy Details (if present) */}
                                                        {request.details && (
                                                            <div className="md:col-span-2 flex items-start gap-2">
                                                                <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                                <div className="flex-1">
                                                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Additional Details</p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{request.details}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleDeleteRequest}
                title="Delete Request"
                message="Are you sure you want to delete this expert request? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDestructive={true}
            />
        </div>
    );
};

export default ExpertRequests;
