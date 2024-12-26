// eslint-disable-next-line no-unused-vars
import React, { useRef, useState } from "react";
import { useAnimationObserver } from "../hooks/useAnimationObserver.jsx";
import { faqs } from "../utils/data.js";
import FAQItem from "./FAQItem.jsx";

function FaQs() {
    const [openIndex, setOpenIndex] = useState(null);
    const handleToggle = (index) => {
        setOpenIndex(index === openIndex ? null : index);
    };
    const containerRef = useRef(null);

    // Use the reusable hook
    useAnimationObserver(containerRef);

    return (
        <div className="bg-gray-100 mx-auto p-8" ref={containerRef}>
            <div className="container mx-auto">
                <h1 className="fade-in delay-200 text-center mb-10 font-semibold md:w-[60%] w-[90%] mx-auto md:text-4xl text-2xl">
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    Need Answers? We've Got You Covered!
                </h1>
                <h2 className="fade-in delay-300 container mx-auto text-start font-bold pb-5">
                    WITH QUICK ANSWERS TO COMMON QUESTIONS
                </h2>
                {faqs.map((faq, index) => (
                    <FAQItem
                        key={index}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openIndex === index}
                        onClick={() => handleToggle(index)}
                    />
                ))}
            </div>
        </div>
    );
}

export default FaQs;
