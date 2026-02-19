import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../animations';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onCancel,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    isDanger = false,
    isLoading = false
}) => {
    const handleClose = onClose || onCancel;
    const destructive = isDestructive || isDanger;
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                >
                    <motion.div
                        variants={modalVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
                    >
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${destructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                <AlertTriangle size={24} />
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                            <p className="text-gray-500 text-sm mb-6">{message}</p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                    }}
                                    disabled={isLoading}
                                    className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition disabled:opacity-50 ${destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    {isLoading ? 'Processing...' : confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
