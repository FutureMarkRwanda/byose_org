import React from 'react';
import { MdOutlineWest } from "react-icons/md";
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <section className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-6 py-8 relative overflow-hidden">
            {/* Ethereal Background Accents */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#195C51]/5 rounded-full blur-[120px] -z-10"></div>
            
            <div className="text-center max-w-2xl space-y-8 animate-slide-entrance">
                {/* Large Subtle Backdrop Text */}
                <div className="relative">
                    <h1 className="text-[12rem] md:text-[18rem] font-bold text-[#F5F5F5] select-none leading-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-[#333333]">
                            Lost in the <span className="text-[#195C51]">void?</span>
                        </h2>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-xl text-gray-500 font-light leading-relaxed">
                        The solution you are looking for might have moved to another dimension. 
                        Let’s get you back to the center of innovation.
                    </p>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        to="/home"
                        className="group flex items-center gap-3 bg-[#195C51] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all active:scale-95"
                    >
                        <MdOutlineWest className="transition-transform group-hover:-translate-x-1" size={20} />
                        Return to Headquarters
                    </Link>
                    
                    <Link
                        to="/contact"
                        className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-[#195C51] transition-colors"
                    >
                        Report a technical glitch
                    </Link>
                </div>
            </div>

           
        </section>
    );
}

export default NotFound;