import React from 'react';
import Video from "./Video.jsx";

function Banner() {
    return (
        <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center google-card p-8 md:p-16">
                <div className="space-y-8">
                    <div className="inline-block px-4 py-1 rounded-full bg-[#195C51]/10 text-[#195C51] text-sm font-bold uppercase tracking-widest">
                        New Release: PresenceEye Pro
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-[#333333] leading-tight">
                        Smart Living, Reimagined.
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Automate your space effortlessly. Start the new year with bold innovations 
                        and cutting-edge automation solutions from B-Tech Labs.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a href="/presence-eye" className="bg-[#195C51] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-lg transition-transform active:scale-95">
                            Visit PresenceEye
                        </a>
                        <a href="/presence-eye/presents" className="px-8 py-4 rounded-2xl font-bold border-2 border-[#EDEDED] text-[#333333] hover:bg-gray-50 transition-colors">
                            View Roadmap →
                        </a>
                    </div>
                </div>
                <div className="relative group ">
                    {/* Futuristic Glow Effect behind video */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#195C51] to-[#50E3C2] opacity-20 blur-3xl group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative rounded-3xl overflow-hidden ">
                        <Video url="https://www.youtube.com/watch?v=79Joly2-FBk" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Banner;