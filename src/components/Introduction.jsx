import React from 'react';
import Video from "./Video.jsx";
import { BiSolidQuoteAltRight } from "react-icons/bi";

function Introduction() {
    return (
        <section className="relative w-full py-20 overflow-hidden bg-white">
            {/* Ethereal background accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#195C51]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="container mx-auto px-6">
                <div className="max-w-4xl space-y-10 relative z-10">
                    <div className="space-y-4">
                        <h2 className="text-[#195C51] font-bold uppercase tracking-[0.3em] text-sm">Genesis</h2>
                        <h1 className="text-5xl md:text-7xl font-bold text-[#333333] leading-tight">
                            Build Your Own <br/>
                            <span className="text-[#195C51]">Solutions</span> Everywhere.
                        </h1>
                    </div>

                    <div className="flex gap-4 items-start bg-[#F5F5F5] p-8 rounded-[2rem] border border-gray-100">
                        <BiSolidQuoteAltRight size={40} className="text-[#195C51] flex-shrink-0" />
                        <div className="space-y-4">
                            <p className="text-xl md:text-2xl font-light italic text-[#333333]">
                                We are the future of innovation in AI and robotics, creating tools that turn every environment into a smart ecosystem.
                            </p>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                From Rwanda to the world, we empower the next generation of engineers and dreamers to solve real-world problems through hands-on technology.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20">
                    <Video url="https://www.youtube.com/watch?v=GyAAYf-oUp8" no_auto={true} />
                </div>
            </div>
        </section>
    );
}

export default Introduction;