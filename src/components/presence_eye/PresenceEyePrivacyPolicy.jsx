import React, { useEffect, useRef, useState } from 'react';
import { sections } from "../../utils/data.js";
import { IoIosArrowBack } from 'react-icons/io';
import { FiFileText } from 'react-icons/fi';

const Section = ({ title, content, delay }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    // Use IntersectionObserver to trigger animation when section comes into view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(ref.current);
                }
            },
            { threshold: 0.2 }
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`mb-6 p-4 border-l-4 border-blue-500 bg-gray-50 rounded shadow 
                  transform transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${delay}s` }}
        >
            <h2 className="flex items-center text-xl font-bold text-gray-800 mb-2">
                <FiFileText className="mr-2" />
                {title}
            </h2>
            <p className="text-base text-gray-600 whitespace-pre-wrap py-4">
                {content}
            </p>
        </div>
    );
};

const PresenceEyePrivacyPolicy = () => {

    return (
        <div id="privacy-policy" className="bg-white min-h-screen container mx-auto py-6">
            {/* App Bar */}
                <h1 className="flex-grow text-start font-bold py-6">
                    Privacy and Policy
                </h1>
            {/* Content */}
            <div className="p-4">
                {sections.map((section, index) => (
                    <Section
                        key={index}
                        title={section.title}
                        content={section.content}
                        delay={index * 0.3}  // Staggered animation delay for each section
                    />
                ))}
            </div>
        </div>
    );
};

export default PresenceEyePrivacyPolicy;
