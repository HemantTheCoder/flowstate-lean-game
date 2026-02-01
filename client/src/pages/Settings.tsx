import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function Settings() {
    return (
        <div className="w-full h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center"
            >
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Settings</h2>

                <div className="space-y-4 mb-8 text-left">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">BGM Volume</span>
                        <input type="range" className="w-1/2" />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">SFX Volume</span>
                        <input type="range" className="w-1/2" />
                    </div>
                </div>

                <Link href="/">
                    <button className="px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors">
                        Back to Home
                    </button>
                </Link>
            </motion.div>
        </div>
    );
}
