// eslint-disable-next-line no-unused-vars
import React, {useEffect} from 'react';
import {Helmet} from "react-helmet";
import {Outlet} from "react-router-dom";
import TitleColor from "../components/TitleColor.jsx";
import PresenceEyeLatest from "../components/presence_eye/PresenceEyeLatest.jsx";

function PresenceEye() {

    // Custom cursor style added through CSS
    useEffect(() => {
        document.body.classList.add('custom-cursor-presence-eye');

        return () => {
            document.body.classList.remove('custom-cursor-presence-eye');
        };
    }, []);
    return (
        <div className="min-h-full flex flex-col justify-center items-center">
            <Helmet>
                <title>PresenceEye | BYOSE</title>
                <meta name="description" content="Learn about PresenceEye, BYOSE's AI-powered multi-socket plug designed for smart home and office automation." />
                <meta name="robots" content="index, follow" />
            </Helmet>
            {/*<img src="https://www.svgrepo.com/show/426192/cogs-settings.svg" alt="Logo" className="mb-8 h-40"/>*/}
            {/*<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-gray-700 dark:text-white mb-4">Site*/}
            {/*    is under maintenance</h1>*/}
            {/*/!* eslint-disable-next-line react/no-unescaped-entities *!/*/}
            {/*<p className="text-center text-gray-500 text-lg md:text-xl lg:text-2xl mb-8">We're working hard to improve the Your experience across all our applications. Stay tuned!</p>*/}
            {/*<div className="flex space-x-4">*/}
            {/*    <a href="/contact"*/}
            {/*       className="text-white hover:scale-105 active:scale-125 bg-gradient-to-tr from-[#195C51] via-gray-900  to-[#195C51] font-bold py-3 px-6 rounded ">Contact*/}
            {/*        Us</a>*/}
            {/*    <a href="/home"*/}
            {/*       className="border-2 border-gray-800 text-black font-bold py-3 px-6 rounded ">Home</a>*/}
            {/*</div>*/}
            <div className={`w-full bg-white p-8`}>
                <h1 className={`text-center mb-10 font-semibold md:w-[60%] w-[90%] mx-auto md:text-4xl text-2xl`}>
                    PresenceEye<br/><br/><TitleColor text={"Because Your Home Deserves Intelligence."}/>
                </h1>
            </div>
            <PresenceEyeLatest/>
            <Outlet/>
        </div>
    );
}

export default PresenceEye;