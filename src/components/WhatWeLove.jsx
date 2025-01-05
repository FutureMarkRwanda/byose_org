// eslint-disable-next-line no-unused-vars
import React from 'react';

function WhatWeLove() {
    return (
    <div className={`bg-gray-100`}>
        <div className={`container mx-auto py-12 flex-col`}>
            <div className={`md:w-[60%] w-[90%] mx-auto pb-6`}>
                <h1 className={`mx-auto text-center font-bold py-6 md:text-4xl text-2xl`}>We love to make great things, things that matter.</h1>
                <p className={` text-center text-xl w-[90%] mx-auto py-4` }>Funding handshake buyer business-to-business metrics iPad partnership. First mover advantage innovator success deployment non-disclosure.</p>
            </div>
            <div>
                <div className="grid grid-cols-6 col-span-2   md:gap-8 gap-4 p-4  ">
                    <div className=" overflow-hidden rounded-xl col-span-3 max-h-[14rem]">
                        <img className="h-full w-full object-cover "
                             src="https://www.imec-int.com/_next/image?url=https%3A%2F%2Fdrupal.imec-int.com%2Fsites%2Fdefault%2Ffiles%2F2022-01%2Frobot.jpg&w=3840&q=75"
                             alt=""/>
                    </div>
                    <div className=" overflow-hidden rounded-xl col-span-3 max-h-[14rem]">
                        <img className="h-full w-full object-cover  "
                             src="https://assets.skyfilabs.com/playto/blog-images/robotics-for-beginners-v3.webp"
                             alt=""/>
                    </div>
                    <div className=" overflow-hidden rounded-xl col-span-2 max-h-[10rem]">
                        <img className="h-full w-full object-cover "
                             src="https://pioneeracademics.com/wp-content/uploads/2023/07/DIY-electronic-kit-for-robotics-competition.png"
                             alt=""/>
                    </div>
                    <div className=" overflow-hidden rounded-xl col-span-2 max-h-[10rem]">
                        <img className="h-full w-full object-cover "
                             src="https://engineering.case.edu/sites/default/files/styles/page_image/public/robot-mantis067.jpg?itok=_1I59H7T"
                             alt=""/>
                    </div>
                    <div className="relative overflow-hidden rounded-xl col-span-2 max-h-[10rem]">
                        <div
                            className="text-white text-xl absolute inset-0  bg-slate-900/80 flex justify-center items-center">
                            10+
                        </div>
                        <img className="h-full w-full object-cover "
                             src="https://acity.edu.gh/study/images/ACITY-Robotic.webp"
                             alt=""/>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}

export default WhatWeLove;