import React from 'react';
import { motion } from 'framer-motion';

const PlaceholderPage = ({ title }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm"
        >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500 max-w-md">
                This feature is currently under development. Check back later for updates.
            </p>
        </motion.div>
    );
};

export default PlaceholderPage;
