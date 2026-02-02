import React from 'react';
import Banner from "../../components/Banner.jsx";
import SimpleStore from "../../components/SimpleStore.jsx";
import OurNumbers from "../../components/OurNumbers.jsx";
import FAQs from "../../components/FAQs.jsx";
import JoinUs from "../../components/JoinUs.jsx";

function Home() {
    return (
        <div className="space-y-32 pb-10">
            {/* Hero Section Context */}
            <section className="px-4 pt-10">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight text-[#333333]">
                        Empowering Everyone to <span className="text-[#195C51]">Use</span> and <span className="text-[#195C51]">Create</span> Smarter Solutions
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
                        We blend high-end robotics with accessible AI to transform how you interact with your environment.
                    </p>
                </div>
            </section>

            <Banner />
            <SimpleStore />
            <section className="rounded-[3rem] mx-4">
                <OurNumbers />
            </section>

            <div className="max-w-5xl mx-auto px-4">
                <FAQs />
            </div>

            <section className="relative overflow-hidden">
                <JoinUs />
            </section>
        </div>
    );
}

export default Home;