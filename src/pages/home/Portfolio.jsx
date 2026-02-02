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

    // Scroll parallax effect for the hero image
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, -100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    if (!teammate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Identity Not Found</p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-40 relative selection:bg-[#195C51]/20">
            
            {/* 1. FLOATING NAVIGATION */}
            <nav className="fixed top-28 left-6 md:left-12 z-40">
                <button 
                    onClick={() => navigate(-1)} 
                    className="group flex items-center gap-4 text-[#333333] transition-all"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-gray-100 flex items-center justify-center group-hover:bg-[#195C51] group-hover:text-white transition-all duration-500">
                        <IoArrowBackOutline size={20} className="group-hover:-translate-x-1 transition-transform"/>
                    </div>
                </button>
            </nav>

            {/* 2. CINEMATIC HERO (Asymmetric) */}
            <div className="relative pt-20 pb-32 overflow-hidden">
                <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left: Text Identity */}
                    <div className="lg:col-span-6 z-10 space-y-12">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-4"
                        >
                            <span className="inline-block px-4 py-1 rounded-full bg-[#195C51]/10 text-[#195C51] text-[10px] font-black uppercase tracking-[0.3em]">
                                Verified Contributor
                            </span>
                            <h1 className="text-6xl md:text-8xl font-bold text-[#333333] leading-[0.85] tracking-tighter">
                                {teammate.name.split(' ')[0]} <br/>
                                <span className="text-[#195C51]">{teammate.name.split(' ').slice(1).join(' ')}</span>
                            </h1>
                        </motion.div>

                        <div className="google-card p-8 bg-white/50 backdrop-blur-md max-w-md border-l-4 border-l-[#195C51]">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Primary Function</h3>
                            <p className="text-xl font-medium text-[#333333]">{teammate.role}</p>
                        </div>
                    </div>

                    {/* Right: Floating Portrait */}
                    <div className="lg:col-span-6 relative">
                        <motion.div 
                            style={{ y: y1 }}
                            className="relative z-10 w-full aspect-[4/5] rounded-[4rem] overflow-hidden google-card shadow-2xl border-none"
                        >
                            <img 
                                src={teammate.images[0]} 
                                className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-110" 
                                alt={teammate.name} 
                            />
                            {/* Visual HUD detail */}
                           
                        </motion.div>
                        
                        {/* Decorative Background Element */}
                        <div className="absolute -top-10 -right-10 w-full h-full bg-[#F5F5F5] rounded-[4rem] -z-10 rotate-3"></div>
                    </div>
                </div>
            </div>

            {/* 3. CONTENT CORE (Markdown) */}
            <div className="container mx-auto px-6 grid lg:grid-cols-12 gap-16 relative">
                <div className="lg:col-span-4 space-y-8">
                    <div className="sticky top-40 space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 border-b border-gray-100 pb-4">
                            Operational Background
                        </h2>
                        <p className="text-sm text-gray-500 font-light leading-relaxed">
                            Detailed records and contributions within the BYOSE Tech ecosystem. This dossier tracks project involvement and strategic leadership roles.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#F5F5F5] p-10 md:p-16 rounded-[4rem] border border-gray-50 shadow-inner"
                    >
                        <Markdown content={teammate.more} />
                    </motion.div>
                </div>
            </div>

            {/* 4. GALLERY ARCHIVE */}
            <div className="mt-40 bg-[#0B121A] py-32 rounded-[5rem] mx-4 overflow-hidden relative">
                {/* Background "Grid" effect */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#195C51 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                
                <div className="container mx-auto px-6 relative z-10 text-center space-y-16">
                    <div className="space-y-4">
                        <h2 className="text-[#195C51] font-bold uppercase tracking-[0.5em] text-[10px]">Archives</h2>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">Visual Field Notes</h1>
                    </div>
                    
                    <div className="flex justify-center">
                        <div className="google-card p-4 bg-white/5 backdrop-blur-md rounded-[3.5rem] border border-white/10">
                            <ImageGallery images={teammate.images} />
                        </div>
                    </div>
                </div>
            </div>

        
        </div>
    );
}

export default Portfolio;