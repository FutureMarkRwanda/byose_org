// eslint-disable-next-line no-unused-vars
import React from "react";
import {values} from "../utils/data.js";
function OurValues() {
    return (
        <div className="bg-gray-100 py-12 px-6">
            <div className="container mx-auto text-center md:text-left flex flex-col gap-4">
                {/* Section Header */}
                <h2 className={`text-start font-bold uppercase`}>OUR Values</h2>
                <h1 className={` text-start font-bold md:text-4xl text-2xl`}>Things in we believe</h1>
                <p className={`text-start pl-6 md:w-1/2 sm:w-2/3 text-gray-600 font-medium italic`}>
                    <b>BYOSE</b> believes in innovation, creativity, and excellence, delivering transformative solutions that empower businesses, inspire growth, and revolutionize industries.
                </p>
                {/* Values Grid */}
                <div className="grid grid-cols-1 md:w-[75%] w-full mx-auto gap-8 mt-10">
                    {values.map((value, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-6 p-4 rounded-lg"
                        >
                            {/* Image */}
                            <img
                                src={value.image}
                                alt={value.title}
                                className="aspect-square md:max-w-60 w-24 object-contain rounded-lg object-center"
                            />
                            {/* Text */}
                            <div>
                                <h3 className="text-xl font-bold">{value.title}</h3>
                                <p className="text-sm text-gray-600 font-medium italic leading-snug mt-2">
                                    {value.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OurValues;
