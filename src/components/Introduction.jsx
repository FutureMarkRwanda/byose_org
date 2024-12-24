// eslint-disable-next-line no-unused-vars
import React from 'react';
import Header from "./Header.jsx";
import Video from "./Video.jsx";
const bgImage = " /assests/images/undraw_join_6quk.svg";
import {BiSolidQuoteAltRight} from "react-icons/bi";
function Introduction() {
    return (
        <div
            className={`w-full bg-gray-100 text-gray-950 flex flex-col gap-3 p-2 container mx-auto bg-no-repeat bg-right-top`}
            style={{
                backgroundImage: `url(${bgImage})`,
            }}
        >
            <Header/>
            <div>
                <div
                    className="custom_container flex flex-col md:max-w-[60%] gap-3 p-5 pt-32 bg-gray-100 text-gray-800 rounded-xl bg-opacity-90">
                    <h1 className="fade-in md:text-4xl font-bold">
                        Welcome to <span className={`bg-clip-text text-transparent bg-gradient-to-tr from-[#38A368] via-gray-950 to-[#38A368]`}>BYOSE</span>
                    </h1>

                    <p className="fade-in delay-1 pl-2 italic font-bold flex gap-3">
                        <BiSolidQuoteAltRight/>
                        <span className="text-xl">Build Your Own Solutions Everywhere</span>
                    </p>

                    <p className="fade-in delay-2 pl-6 md:text-xl font-medium text-gray-700">
                        We are the future of innovation in AI and robotics.
                    </p>
                    <p className="fade-in delay-3 pl-10 md:text-xl font-medium text-gray-700">
                        Creating cutting-edge solutions for smarter living,
                        <br/> we empower students with tools to excel in AI and robotics.
                    </p>
                    <p className="fade-in delay-4 pl-14 md:text-xl font-medium  text-gray-700">
                        Offering innovative products, digital solutions,
                        <br/> and opportunities for growth, we help you achieve your tech aspirations.
                    </p>
                </div>
            </div>
            <Video url={"https://www.youtube.com/watch?v=GyAAYf-oUp8"}/>
        </div>
    );
}

export default Introduction;
