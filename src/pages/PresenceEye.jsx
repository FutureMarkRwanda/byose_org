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