// eslint-disable-next-line no-unused-vars
import React from 'react';
const image = " /assests/images/wave-vr-haikei.svg";

function OurStory() {
    return (
        <div className={`bg-gray-100 bg-no-repeat bg-right-top flex`} style={{ backgroundImage: `url(${image})` }}>
            <div className={`container mx-auto md:py-20 py-16 p-6 flex flex-col gap-4 `}>
                <div className={`bg-gray-100 rounded-lg md:w-1/2 w-4/5 py-3`}>
                    <h2 className={`text-start font-bold `}>OUR STORY</h2>
                    <h1 className={` text-start font-bold md:text-4xl text-2xl `}>The Narrative That Defines Us</h1>
                </div>
                <p className={`text-start pl-6 md:w-1/2 sm:w-2/3 text-gray-600 font-medium italic bg-gray-100 rounded-lg`}>
                    <b>BYOSE</b> began with a vision to transform challenges into opportunities through innovation, creativity, and technology. Inspired by the belief that solutions to local and global problems can emerge from anyone, anywhere, BYOSE was founded to empower young innovators to build their own solutions. Starting as a small initiative driven by passion for AI and robotics, it grew into a platform that fosters learning, creativity, and technological advancement. With a focus on education, digital innovation, and cutting-edge projects, BYOSE strives to inspire and lead a new wave of innovation local and beyond.
                </p>
            </div>
        </div>
    );
}

export default OurStory;
