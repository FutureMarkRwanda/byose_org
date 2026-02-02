import React from 'react';
import { Link } from 'react-router-dom';

function ProfileCard({ name, image, role, link }) {
    return (
        <Link 
            to={"/we-are/" + link} 
            className="group block text-center space-y-8 p-4 transition-all duration-500"
        >
            <div className="relative mx-auto w-64 h-64 md:w-72 md:h-72">
                
                {/* 1. THE DIGITAL HALO (Ethereal Tech Ring) */}
                <div className="absolute inset-0 rounded-[3.5rem] border-[1px] border-[#195C51]/10 scale-110 group-hover:scale-100 group-hover:rotate-90 transition-all duration-[1.2s] ease-out"></div>
                <div className="absolute inset-0 rounded-[3.5rem] border-[1px] border-dashed border-[#195C51]/20 scale-105 group-hover:rotate-[-45deg] transition-all duration-[1.5s] ease-out"></div>
                
                {/* 2. THE IMAGE CONTAINER */}
                <div className="absolute inset-0 overflow-hidden rounded-[3rem] bg-[#F5F5F5] google-card border-none shadow-none group-hover:shadow-2xl group-hover:shadow-[#195C51]/10 transition-all duration-500">
                    <img 
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out"
                        src={image}
                        alt={name}
                        loading="lazy"
                    />
                    
                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#195C51]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
            </div>

            {/* 3. TYPOGRAPHY */}
            <div className="space-y-2 relative">
                <h4 className="text-2xl font-bold text-[#333333] group-hover:text-[#195C51] transition-colors tracking-tight">
                    {name}
                </h4>
                <div className="flex items-center justify-center gap-3">
                    <span className="w-4 h-[1px] bg-gray-200 group-hover:w-8 group-hover:bg-[#195C51] transition-all duration-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-gray-600 transition-colors">
                        {role}
                    </span>
                    <span className="w-4 h-[1px] bg-gray-200 group-hover:w-8 group-hover:bg-[#195C51] transition-all duration-500"></span>
                </div>
            </div>
        </Link>
    );
}

export default ProfileCard;