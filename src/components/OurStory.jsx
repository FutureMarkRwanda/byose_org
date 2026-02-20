function OurStory() {
    return (
        <section className="bg-white py-16 md:py-32"> {/* Reduced mobile padding */}
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    <div className="space-y-6 lg:sticky lg:top-32"> {/* Sticky only on large screens */}
                        <h2 className="text-[#195C51] font-bold uppercase tracking-[0.2em] text-xs md:text-sm">The Narrative</h2>
                        <h1 className="text-3xl md:text-6xl font-bold text-[#333333] leading-tight">A Journey of <br className="hidden md:block"/>Calculated Risk.</h1>
                        <div className="w-16 md:w-20 h-1 bg-[#195C51]"></div>
                    </div>
                    
                    <div className="space-y-6 md:space-y-8 text-base md:text-lg font-light text-gray-600 leading-relaxed md:leading-loose italic border-l-2 border-[#F5F5F5] pl-6 md:pl-8">
                        <p>
                            <span className="text-2xl md:text-3xl font-bold text-[#195C51] not-italic">BYOSE</span> began with a simple question...
                        </p>
                        <p>
                            We believe that technology shouldn&apos;t just be imported; it should be created where it&apos;s needed most. Our story is one of bridging the gap between imagination and hardware, turning microcontrollers and lines of code into tools for smarter living.
                        </p>
                        <p>
                            Today, BYOSE stands as a hub for research, education, and development, committed to making &quot;Made in Africa&quot; synonymous with &quot;High-End Intelligence.&quot;
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurStory;