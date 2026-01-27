import React from 'react';
import ProductCard from "./ProductCard.jsx";
import { highlight_products } from "../utils/data.js";
import { MdOutlineSecurity, MdMemory, MdAutoMode, MdLocalShipping } from "react-icons/md";

function SimpleStore() {
    const perks = [
        { icon: MdMemory, title: "Next-Gen Tech", desc: "Built with the latest ESP32 and AI modules." },
        { icon: MdAutoMode, title: "Self-Managed", desc: "Systems that learn and adapt to your habits." },
        { icon: MdOutlineSecurity, title: "Secure by Design", desc: "Encrypted local control for your privacy." },
        { icon: MdLocalShipping, title: "Global Reach", desc: "Doorstep delivery for all our tech kits." }
    ];

    return (
        <div className="bg-white py-2">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <h2 className="text-[#195C51] font-bold uppercase tracking-[0.2em] text-sm">B-Store Ecosystem</h2>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#333333]">Crafted for the Future.</h1>
                    <p className="text-gray-500 text-lg font-light">Explore our handpicked selection of smart devices and educational tools designed to bring intelligence to your everyday life.</p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {highlight_products.map((product) => (
                        <div key={product.id} className="hover:scale-[1.02] transition-transform duration-500">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                {/* Perks/Benefits Grid */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-t border-gray-100 pt-16">
                    {perks.map((perk, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 rounded-2xl bg-[#F5F5F5] text-[#195C51]">
                                <perk.icon size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-[#333333]">{perk.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">{perk.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SimpleStore;