// eslint-disable-next-line no-unused-vars
import React, {useRef} from "react";
import {useAnimationObserver} from "../hooks/useAnimationObserver.jsx";
import {RiArrowUpDoubleFill} from "react-icons/ri";

// eslint-disable-next-line react/prop-types
export default function FAQItem({ question, answer, isOpen, onClick }) {
    const containerRef = useRef(null);

    // Use the reusable hook
    useAnimationObserver(containerRef);
    return (
        <div className="mb-4 bg-white rounded shadow-md" ref={containerRef}>
            <div
                className="flex items-center justify-between bg-white pl-3 pr-2 py-3 w-full rounded text-gray-800 font-bold cursor-pointer hover:bg-gray-200"
                onClick={onClick}
                role="button"
                aria-expanded={isOpen}
            >
                {question}
                <span className="flex items-center justify-center text-[#195C51]">
                        <RiArrowUpDoubleFill size={20} className={`fill-current transform transition-transform duration-200 ${
                            isOpen ? "rotate-180" : "rotate-0"
                        }`}/>
                </span>
            </div>
            {isOpen && (
                <div className="p-3">
                    {/* eslint-disable-next-line react/prop-types */}
                    {answer.map((text, index) => (
                        <p key={index} className="text-gray-700 mb-3 fade-in md:w-3/5 w-full">
                            {text}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}