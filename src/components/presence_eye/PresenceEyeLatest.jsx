// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import TitleColor from "../TitleColor.jsx";
import { useSpring, animated } from 'react-spring';
import ImageSlider from "../ImageSlider.jsx";
import DownloadApp from "./DownloadApp.jsx";
import {presence_eye_lite_images} from "../../utils/data.js";


// eslint-disable-next-line no-unused-vars,react/prop-types
function PresenceEyeLatest({ className = "" }) {
    const neonGlow = useSpring({
        from: { textShadow: '0 0 10px #fff' },
        to: { textShadow: '0 0 20px #ff4da6' },
        config: { duration: 1000 },
        reset: true,
        reverse: true,
        loop: true,
    });

    return (
    <>
        <div className={`w-full md:grid md:grid-cols-2 p-4 pb-[8rem]`}>
            <ImageSlider className={`h-[50vh]`} image_size={`object-cover`} images={presence_eye_lite_images}/>
            <div className={`py-8 px-6`}>
                <h1 className={`text-start mb-10 font-semibold mx-auto md:text-4xl text-2xl`}>
                    Presence Eye <TitleColor text={"Lite"}/>
                </h1>
                <p className={`text-start md:w-[80%] w-full py-6 md:text-2xl text-xl`}>
                    Choose the perfect fit for your home, with customizable colors and options. Place your order today, or <a href="/contact-us">contact us</a> for more details!
                </p>
                <div className={`py-5`}>
                    <a href={`/presence-eye/lite/presents`} className={`text-white active:scale-110 m-1 p-3 px-4 rounded-full font-medium bg-gradient-to-tr from-[#195C51] via-gray-900  to-[#195C51] hover:bg-gradient-to-tl hover:from-[#195C51] hover:via-gray-900 hover:to-[#195C51] `}>
                        Order now
                    </a>
                    {/*<a href={`/presence-eye/presents`} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-7 active:scale-110 text-base text-body-color font-medium hover:text-gray-700 transition ">*/}
                    {/*    Take a closer Look*/}
                    {/*</a>*/}
                    <a href={`/presence-eye/presents`} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-7 active:scale-110 text-base text-body-color font-medium hover:text-gray-700 transition ">
                        Read more →
                    </a>
                </div>
            </div>
        </div>
        <DownloadApp/>
        <div
            className={`relative bg-[#121922] text-white bg-center h-[105vh] p-2 bg-cover w-full flex justify-center items-center`}
            style={{
                backgroundImage: `url(https://res.cloudinary.com/ddsojj7zo/image/upload/v1744275689/byose%20org%20site/mzyjdg98r7xzholutufg.png)`,
            }}
        >
            {/* Dark blur overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 backdrop-blur-md"></div>

            <div className="text-white pb-[15vh] flex flex-col gap-5">
                <h1 className="font-semibold md:text-3xl text-xl text-center">
                    With
                </h1>
                <h1 className="font-semibold md:text-4xl text-2xl text-center">
                    Presence Eye
                </h1>
                <animated.h1 style={neonGlow} className="text-5xl text-center font-semibold">
                    Turn Every Room Into a Genius.
                </animated.h1>
            </div>
        </div>
    </>
    );
}

export default PresenceEyeLatest;
