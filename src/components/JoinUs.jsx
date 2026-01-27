import React from 'react';
import Video from "./Video.jsx";

function JoinUs() {
    return (
        <div className="container mx-auto px-6 py-24">
            <div className="bg-[#F5F5F5] rounded-[4rem] p-8 md:p-16 lg:p-20 flex flex-col lg:flex-row items-center gap-12 overflow-hidden border border-gray-100">
                
                {/* Left Side: Content */}
                <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#195C51]/10 text-[#195C51] text-xs font-bold uppercase tracking-widest">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#195C51] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#195C51]"></span>
                        </span>
                        Community
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#333333] leading-[1.1]">
                        Build the future <br/> <span className="text-[#195C51]">with us.</span>
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                        Join a global network of innovators. Whether you're a student, an engineer, or a dreamer, BYOSE provides the tools and the tribe to make your ideas reality.
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                        <a href="/signup" className="bg-[#195C51] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all hover:-translate-y-1 active:scale-95">
                            Get Started Now
                        </a>
                        <a href="/contact" className="px-10 py-4 rounded-2xl font-bold border-2 border-[#D1D5DB] text-[#333333] hover:bg-white transition-all">
                            Inquire More
                        </a>
                    </div>
                </div>

                {/* Right Side: Video (Properly Scaled) */}
                <div className="lg:w-1/2 w-full flex justify-center">
                    <div className="w-full max-w-lg transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                        {/* 
                           Notice we use the Video component directly here. 
                           The Video component's internal 'max-w' will work 
                           harmoniously within this lg:w-1/2 container.
                        */}
                        <Video url="https://www.youtube.com/watch?v=MnjP2a9vs0s" no_auto={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JoinUs;