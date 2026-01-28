import React from 'react';
import { motion } from 'framer-motion';

const LoadingPage = ({ message = "Initializing Ecosystem" }) => {
    return (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#195C51]/5 rounded-full blur-[100px]"></div>

            <div className="relative flex flex-col items-center gap-12">
                {/* The Logo Pulse */}
                <div className="relative flex items-center justify-center">
                    {/* Inner Breathing Logo */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8] 
                        }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="relative z-10"
                    >
                        <img src="/assets/icons/Logo01.svg" className="h-16 w-16" alt="BYOSE" />
                    </motion.div>

                    {/* Outer Rotating High-Tech Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ 
                            duration: 10, 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                        className="absolute w-28 h-28 border-[1px] border-dashed border-[#195C51]/30 rounded-[2.5rem]"
                    />

                    {/* Second counter-rotating ring */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ 
                            duration: 15, 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                        className="absolute w-36 h-36 border-[0.5px] border-[#195C51]/10 rounded-[3rem]"
                    />
                </div>

                {/* Status Text */}
                <div className="space-y-3 text-center">
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-[#195C51] animate-pulse"
                    >
                        {message}
                    </motion.p>
                    
                    {/* Minimalist Progress Line */}
                    <div className="w-48 h-[1px] bg-gray-100 mx-auto relative overflow-hidden rounded-full">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-[#195C51] to-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-12 opacity-20">
                <p className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-500">
                    Cloud Infrastructure v2.4
                </p>
            </div>
        </div>
    );
};

export default LoadingPage;