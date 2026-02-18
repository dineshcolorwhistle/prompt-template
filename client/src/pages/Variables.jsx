import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Search, X, Save, AlertCircle } from 'lucide-react';

const Variables = () => {
    const { userInfo } = useAuth();
    const [variables, setVariables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVariable, setCurrentVariable] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        defaultValue: '',
        isRequired: false
    });
    const [error, setError] = useState(null);
    const [modalError, setModalError] = useState(null);

    useEffect(() => {
        fetchVariables();
    }, []);

    const fetchVariables = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/variables`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setVariables(data);
            } else {
                setError(data.message || 'Failed to fetch variables');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this variable?')) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/variables/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            if (response.ok) {
                setVariables(variables.filter(v => v._id !== id));
            } else {
                alert('Failed to delete variable');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenModal = (variable = null) => {
        if (variable) {
            setCurrentVariable(variable);
            setFormData({
                name: variable.name,
                description: variable.description,
                defaultValue: variable.defaultValue,
                isRequired: variable.isRequired
            });
        } else {
            setCurrentVariable(null);
            setFormData({
                name: '',
                description: '',
                defaultValue: '',
                isRequired: false
            });
        }
        setModalError(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError(null);

        try {
            const url = currentVariable
                ? `${import.meta.env.VITE_API_URL}/api/variables/${currentVariable._id}`
                : `${import.meta.env.VITE_API_URL}/api/variables`;

            const method = currentVariable ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setIsModalOpen(false);
                fetchVariables();
            } else {
                setModalError(data.message || 'Failed to save variable');
            }
        } catch (err) {
            setModalError(err.message);
        }
    };

    const filteredVariables = variables.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Variables</h1>
                    <p className="text-gray-500">Manage template variables and placeholders.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Variable
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search variables..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Default Value</th>
                                <th className="px-6 py-3">Required</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-6 text-center text-gray-500">Loading variables...</td></tr>
                            ) : filteredVariables.length === 0 ? (
                                <tr><td colSpan="5" className="p-6 text-center text-gray-500">No variables found.</td></tr>
                            ) : (
                                filteredVariables.map((variable) => (
                                    <tr key={variable._id} className="hover:bg-gray-50 group">
                                        <td className="px-6 py-3 font-medium text-gray-900 font-mono">
                                            {`{{${variable.name}}}`}
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 max-w-xs truncate" title={variable.description}>{variable.description}</td>
                                        <td className="px-6 py-3 text-gray-600 font-mono text-xs bg-gray-50 px-2 py-1 rounded inline-block mt-2">{variable.defaultValue}</td>
                                        <td className="px-6 py-3">
                                            {variable.isRequired ? (
                                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium">Required</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-medium">Optional</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(variable)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(variable._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 text-lg">
                                {currentVariable ? 'Edit Variable' : 'Add Variable'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {modalError && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} />
                                    {modalError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Variable Name<span className="text-red-500 ml-1">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono transition-colors"
                                    placeholder="e.g. topic"
                                />
                                <p className="text-xs text-gray-400 mt-1">Usage: {"{{name}}"}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description<span className="text-red-500 ml-1">*</span></label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors"
                                    placeholder="What is this variable for?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Default Value<span className="text-red-500 ml-1">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={formData.defaultValue}
                                    onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    placeholder="Enter default value"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isRequired"
                                    checked={formData.isRequired}
                                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="isRequired" className="text-sm text-gray-700">Required Field</label>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Save Variable
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Variables;
