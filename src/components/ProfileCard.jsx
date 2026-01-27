import React from 'react';

function ProfileCard({ name, image, role, link }) {
    return (
        <a href={"/we-are/" + link} className="group block text-center space-y-6">
            <div className="relative mx-auto w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80">
                {/* Ethereal Ring */}
                <div className="absolute inset-0 rounded-[3rem] border-2 border-dashed border-[#195C51]/20 group-hover:rotate-45 transition-transform duration-1000"></div>
                
                <div className="absolute inset-3 overflow-hidden rounded-[2.5rem] google-card">
                    <img 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110"
                        src={image}
                        alt={name}
                        loading="lazy"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <h4 className="text-2xl font-bold text-[#333333] group-hover:text-[#195C51] transition-colors">{name}</h4>
                <span className="block text-sm font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">{role}</span>
            </div>
        </a>
    );
}

export default ProfileCard;