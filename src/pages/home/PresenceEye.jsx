import React from 'react';
import { Outlet } from "react-router-dom";
import TitleColor from "../../components/TitleColor.jsx";

function PresenceEye() {
    return (
        <section className="bg-white min-h-screen">
            {/* Minimalist Hero Header */}
            <div className="container mx-auto px-6 pt-20 pb-12 text-center space-y-4">
                <h2 className="text-[#195C51] font-bold uppercase tracking-[0.4em] text-xs animate-fade-in">
                    Hardware Ecosystem
                </h2>
                <h1 className="text-5xl md:text-7xl font-bold text-[#333333] leading-tight">
                    PresenceEye
                </h1>
                <div className="max-w-2xl mx-auto">
                    <p className="text-xl text-gray-400 font-light italic">
                        <TitleColor text="Because your home deserves intelligence." />
                    </p>
                </div>
            </div>

            {/* Content Slot */}
            <div className="relative">
                <Outlet />
            </div>
        </section>
    );
}

export default PresenceEye;