import React from 'react';
import { news } from "../utils/data.js";
import { MdOutlineArrowOutward } from "react-icons/md";

function News() {
    return (
        <section className="bg-white py-32">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-gray-100 pb-12">
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-[#195C51] font-bold uppercase tracking-widest text-sm">Intelligence Report</h2>
                        <h1 className="text-4xl md:text-6xl font-bold text-[#333333]">Latest in Tech.</h1>
                    </div>
                    <p className="text-gray-500 font-medium italic max-w-xs text-right">
                        Curated insights into the world of AI, Robotics, and Digital Evolution.
                    </p>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {news.map((item) => (
                        <div key={item.id} className="group cursor-pointer">
                            <div className="overflow-hidden rounded-[2rem] bg-gray-100 mb-8 aspect-video relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all"></div>
                            </div>

                            <div className="space-y-4 px-2">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#195C51] bg-[#195C51]/10 px-3 py-1 rounded-full">
                                        Technology
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                        5 Min Read
                                    </span>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-[#333333] leading-tight group-hover:text-[#195C51] transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                
                                <p className="text-gray-500 font-light leading-relaxed line-clamp-3">
                                    {item.description}
                                </p>

                                <a 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#333333] hover:text-[#195C51] transition-colors pt-4"
                                >
                                    Read Article
                                    <MdOutlineArrowOutward size={18} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Decorative Line */}
                <div className="mt-32 flex justify-center">
                    <div className="w-24 h-1 bg-[#F5F5F5] rounded-full"></div>
                </div>
            </div>
        </section>
    );
}

export default News;