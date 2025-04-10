// eslint-disable-next-line no-unused-vars
import React from 'react';
import TitleColor from "./TitleColor.jsx";
import Video from "./Video.jsx";

function JoinUs() {
    return (
        <div className="container mx-auto mt-24">
            {/*<h1 className={`text-center mb-10 font-semibold md:w-[60%] w-[90%] mx-auto md:text-4xl text-2xl`}>We believe*/}
            {/*    in innovation that empowers everyone to <TitleColor text={"Use"}/> and <TitleColor*/}
            {/*        text={"Create"}/> smarter solutions</h1>*/}
            <div className={`flex md:flex-row flex-col gap-4 justify-between align-middle`}>
                <div className={`md:max-w-[40%] max-w-[90%] flex flex-col justify-center align-middle items-center`}>
                    <div className={`px-8 flex flex-col gap-3 pt-12 `}>
                        <h1 className={`md:text-4xl text-2xl font-semibold`}>
                            Join the Club
                        </h1>
                        <p className={`md:text-xl text-xl font-normal`}>
                            {/* eslint-disable-next-line react/no-unescaped-entities */}
                            Join Byose community and unlock a world of possibilities. As a member, you'll gain exclusive access to innovative tools, personalized solutions, and a network of like-minded individuals driving their own journeys forward.
                        </p>
                        <div className={`py-5`}>
                            <a href={`/signup`}
                               className={`text-white active:scale-110 m-1 p-3 px-4 rounded-full font-medium bg-gradient-to-tr from-[#195C51] via-gray-900  to-[#195C51] hover:bg-gradient-to-tl hover:from-[#195C51] hover:via-gray-900 hover:to-[#195C51] `}>
                                Join now
                            </a>
                            <a href={`/contact`} target="_blank" rel="noopener noreferrer"
                               className="inline-block py-2 px-7 active:scale-110 text-base text-body-color font-medium hover:text-gray-700 transition ">
                                Get in Touch→
                            </a>
                        </div>
                    </div>
                </div>
                <div className={`flex justify-end`}>
                    <Video url={`https://www.youtube.com/watch?v=MnjP2a9vs0s`} no_auto={true}/>
                </div>
            </div>
        </div>
    );
}

export default JoinUs;