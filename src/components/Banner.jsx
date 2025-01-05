// eslint-disable-next-line no-unused-vars
import React from 'react';
import Video from "./Video.jsx";

function Banner() {
    return (
    <div className="bg-gray-100">
        <div className="container mx-auto py-10">
            <div className={`flex md:flex-row flex-col gap-4 justify-between align-middle`}>
                <div className={`md:max-w-[40%] max-w-[90%] flex flex-col justify-center align-middle items-center`}>
                    <div className={`px-8 flex flex-col gap-3 pt-12 `}>
                        <h1 className={`md:text-3xl text-xl font-medium`}>
                            Smart Living,<br/> Automate your space effortlessly with PresenceEye Pro.
                        </h1>
                        <p className={`md:text-xl text-xl font-normal`}>
                            Start the new year with bold innovations and cutting-edge automation solutions from B-Tech Labs.
                        </p>
                        <div className={`py-5`}>
                            <a href={`/b-store`} className={`text-white active:scale-110 m-1 p-3 px-4 rounded-full font-medium bg-gradient-to-tr from-[#195C51] via-gray-900  to-[#195C51] hover:bg-gradient-to-tl hover:from-[#195C51] hover:via-gray-900 hover:to-[#195C51] `}>
                                Shop now
                            </a>
                            <a href={`/presence-eye`} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-7 active:scale-110 text-base text-body-color font-medium hover:text-gray-700 transition ">
                              Read more →
                            </a>
                        </div>
                    </div>
                </div>
                <div className={`flex justify-end`}>
                    <Video url={`https://www.youtube.com/watch?v=hXHWf-Ac4dY`}/>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Banner;