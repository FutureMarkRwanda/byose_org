import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { team } from "../../utils/data.js";
import { ImageGallery } from "../../components/ImageGallery.jsx";
import Markdown from "../../components/Markdown.jsx";
import { IoArrowBackOutline } from "react-icons/io5";
import { motion, useScroll, useTransform } from "framer-motion";

function Portfolio() {
    const { name } = useParams();
    const navigate = useNavigate();
    const teammate = team.find(member => member.link.toLowerCase() === name.toLowerCase());

    // Scroll parallax effect for the hero image (Desktop only)
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, -100]);

    if (!teammate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Identity Not Found</p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20 relative selection:bg-[#195C51]/20">
            
            {/* 1. FLOATING NAVIGATION */}
            <nav className="fixed top-24 md:top-28 left-4 md:left-12 z-40">
                <button 
                    onClick={() => navigate(-1)} 
                    className="group flex items-center gap-4 text-[#333333] transition-all"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white shadow-xl border border-gray-100 flex items-center justify-center group-hover:bg-[#195C51] group-hover:text-white transition-all duration-500">
                        <IoArrowBackOutline size={20} className="group-hover:-translate-x-1 transition-transform"/>
                    </div>
                </button>
            </nav>

            {/* 2. CINEMATIC HERO */}
            <div className="relative pt-12 md:pt-20 pb-16 md:pb-32 overflow-hidden">
                <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left: Text Identity - Comes second on mobile for better flow */}
                    <div className="lg:col-span-6 z-10 space-y-8 md:space-y-12 order-2 lg:order-1">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <span className="inline-block px-4 py-1 rounded-full bg-[#195C51]/10 text-[#195C51] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                                Verified Contributor
                            </span>
                            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-[#333333] leading-[0.9] tracking-tighter">
                                {teammate.name.split(' ')[0]} <br/>
                                <span className="text-[#195C51]">{teammate.name.split(' ').slice(1).join(' ')}</span>
                            </h1>
                        </motion.div>

                        <div className="google-card p-6 md:p-8 bg-white/50 backdrop-blur-md max-w-md border-l-4 border-l-[#195C51]">
                            <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Primary Function</h3>
                            <p className="text-lg md:text-xl font-medium text-[#333333]">{teammate.role}</p>
                        </div>
                    </div>

                    {/* Right: Portrait - Comes first on mobile */}
                    <div className="lg:col-span-6 relative order-1 lg:order-2">
                        <motion.div 
                            style={{ y: window.innerWidth > 1024 ? y1 : 0 }}
                            className="relative z-10 w-full aspect-square sm:aspect-[4/5] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden google-card shadow-2xl border-none"
                        >
                            <img 
                                src={teammate.images[0]} 
                                className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-110" 
                                alt={teammate.name} 
                            />
                        </motion.div>
                        
                        {/* Decorative Background Element (Hidden on smallest phones to save space) */}
                        <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 w-full h-full bg-[#F5F5F5] rounded-[2.5rem] md:rounded-[4rem] -z-10 rotate-3"></div>
                    </div>
                </div>
            </div>

            {/* 3. CONTENT CORE (Markdown Section) */}
            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 relative">
                {/* Section Title Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="lg:sticky lg:top-40 space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-100 pb-4">
                            Operational Background
                        </h2>
                        <p className="text-sm text-gray-500 font-light leading-relaxed hidden lg:block">
                            Detailed records and contributions within the BYOSE Tech ecosystem. This dossier tracks project involvement and strategic leadership roles.
                        </p>
                    </div>
                </div>

                {/* The Biography Content */}
                <div className="lg:col-span-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#F5F5F5] p-6 sm:p-10 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-gray-50 shadow-inner"
                    >
                        <Markdown content={teammate.more} />
                    </motion.div>
                </div>
            </div>

            {/* 4. GALLERY ARCHIVE */}
            <div className="mt-20 md:mt-40 bg-[#0B121A] py-20 md:py-32 rounded-[3rem] md:rounded-[5rem] mx-4 overflow-hidden relative">
                {/* Background "Grid" effect */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#195C51 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                
                <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-[#195C51] font-bold uppercase tracking-[0.5em] text-xs">Archives</h2>
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">Visual Field Notes</h1>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto md:mx-0">Photographic evidence of technical field operations and R&D phases.</p>
                    </div>
                    
                    <div className="flex justify-center w-full md:w-auto">
                        <div className="google-card p-3 md:p-4 bg-white/5 backdrop-blur-md rounded-[2rem] md:rounded-[3.5rem] border border-white/10 scale-90 sm:scale-100">
                            <ImageGallery images={teammate.images} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Portfolio;