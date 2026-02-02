import React from "react";
import { values } from "../utils/data.js";

function OurValues() {
    return (
        <section className="bg-[#F5F5F5] py-24 rounded-[4rem] mx-4 mb-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-[#195C51] font-bold uppercase tracking-widest text-sm">Our Philosophy</h2>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#333333]">The Values We Breathe.</h1>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {values.map((value, index) => (
                        <div key={index} className="google-card p-10 space-y-6 group hover:bg-[#195C51] transition-all duration-500">
                            <div className="w-20 h-20 overflow-hidden rounded-2xl bg-[#F5F5F5] group-hover:scale-110 transition-transform">
                                <img src={value.image} alt={value.title} className="w-full h-full object-contain p-4" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#333333] group-hover:text-white transition-colors">{value.title}</h3>
                            <p className="text-gray-500 group-hover:text-white/80 transition-colors font-light leading-relaxed">
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default OurValues;