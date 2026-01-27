import React from 'react';
import { MdArrowForward } from "react-icons/md";

function ProductCard({ product }) {
    return (
        <div className="google-card p-4 flex flex-col h-full">
            <div className="overflow-hidden rounded-2xl bg-gray-50 mb-6">
                <img 
                    className="w-full aspect-square object-contain transition-transform duration-500 hover:scale-110" 
                    src={product.image}
                    alt={product.name}
                />
            </div>
            <div className="flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-[#333333] mb-4 px-2">{product.name}</h3>
                <a  
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="mt-auto group flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 hover:bg-[#195C51] hover:text-white transition-all font-medium text-[#195C51]"
                >
                    Explore Product
                    <MdArrowForward className="transform group-hover:translate-x-1 transition-transform" size={20} />
                </a>
            </div>
        </div>
    );
}

export default ProductCard;