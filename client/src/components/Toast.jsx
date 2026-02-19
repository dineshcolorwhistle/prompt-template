import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toastVariants } from '../animations';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
        warning: <AlertCircle className="text-yellow-500" size={20} />
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200',
        warning: 'bg-yellow-50 border-yellow-200'
    };

    const textColors = {
        success: 'text-green-800',
        error: 'text-red-800',
        info: 'text-blue-800',
        warning: 'text-yellow-800'
    };

    return (
        <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`fixed top-4 right-4 z-50 flex items-start p-4 rounded-xl shadow-lg border ${bgColors[type]} max-w-sm`}
            layout
        >
            <div className="flex-shrink-0 mt-0.5 mr-3">
                {icons[type]}
            </div>
            <div className="flex-1 mr-2">
                <p className={`text-sm font-medium ${textColors[type]}`}>
                    {message}
                </p>
            </div>
            <button
                onClick={onClose}
                className={`p-1 rounded-full hover:bg-black/5 transition-colors ${textColors[type]}`}
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

export default Toast;
