import React from 'react';

function OurStory() {
    return (
        <section className="bg-white py-32">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-start">
                    <div className="space-y-6 sticky top-32">
                        <h2 className="text-[#195C51] font-bold uppercase tracking-[0.2em] text-sm">The Narrative</h2>
                        <h1 className="text-4xl md:text-6xl font-bold text-[#333333]">A Journey of <br/>Calculated Risk.</h1>
                        <div className="w-20 h-1 bg-[#195C51]"></div>
                    </div>
                    
                    <div className="space-y-8 text-lg font-light text-gray-600 leading-loose italic border-l-2 border-[#F5F5F5] pl-8">
                        <p>
                            <span className="text-3xl font-bold text-[#195C51] not-italic">BYOSE</span> began with a simple question: Why wait for solutions when we can build them? What started as a small passion project in AI and robotics grew into a movement for localized innovation.
                        </p>
                        <p>
                            We believe that technology shouldn't just be imported; it should be created where it's needed most. Our story is one of bridging the gap between imagination and hardware, turning microcontrollers and lines of code into tools for smarter living.
                        </p>
                        <p>
                            Today, BYOSE stands as a hub for research, education, and development, committed to making "Made in Africa" synonymous with "High-End Intelligence."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurStory;