import React from 'react';
import { MdOutlineArrowForward } from "react-icons/md";

function Action() {
    return (
        <section className="container mx-auto px-6 py-24">
            <div className="google-card bg-[#F5F5F5] p-8 md:p-16 lg:p-24 overflow-hidden relative">
                {/* Decorative Ethereal Element */}
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#195C51]/5 rounded-full blur-3xl"></div>
                
                <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-[#195C51] font-bold uppercase tracking-[0.2em] text-sm">The Ecosystem</h2>
                            <h1 className="text-4xl md:text-5xl font-bold text-[#333333] leading-tight">
                                Making Life Simpler <br/> and Smarter for Everyone.
                            </h1>
                        </div>
                        
                        <p className="text-lg md:text-xl text-gray-600 font-light leading-relaxed">
                            At BYOSE, we transform lives through innovation. From smart home automation to advanced robotics, 
                            we design solutions that simplify routines and empower communities.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {['B-Academy', 'B-Store', 'B-Tech Labs'].map((item) => (
                                <span key={item} className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold text-[#195C51] shadow-sm">
                                    {item}
                                </span>
                            ))}
                        </div>

                        <div className="pt-6">
                            <a href="/presence-eye" className="inline-flex items-center gap-4 bg-[#195C51] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all active:scale-95 group">
                                Explore PresenceEye
                                <MdOutlineArrowForward className="group-hover:translate-x-2 transition-transform" size={24} />
                            </a>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 bg-white rounded-[3rem] shadow-inner"></div>
                        <img 
                            alt="Smart Home Overview" 
                            className="relative rounded-[2.5rem] shadow-2xl object-cover aspect-[4/3] grayscale hover:grayscale-0 transition-all duration-700"
                            src="https://www.houseper.com/wp-content/uploads/2020/05/system_overview_home-1.jpg"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Action;  