// eslint-disable-next-line no-unused-vars
import React, {useRef, useState} from 'react';
import TitleColor from "../TitleColor.jsx";
import { useSpring, animated } from 'react-spring';
import ImageSlider from "../ImageSlider.jsx";
import DownloadApp from "./DownloadApp.jsx";
import { presence_eye_lite_images } from "../../utils/data.js";
import emailjs from "@emailjs/browser";
import {publicKey, viteemailserviceid, viteemailtemplate} from "../../utils/variable.js";

// eslint-disable-next-line no-unused-vars,react/prop-types
function PresenceEyeLatest({ className = "" }) {
    const [showForm, setShowForm] = useState(false);
    const neonGlow = useSpring({
        from: { textShadow: '0 0 10px #fff' },
        to: { textShadow: '0 0 20px #ff4da6' },
        config: { duration: 1000 },
        reset: true,
        reverse: true,
        loop: true,
    });

    const form = useRef();
    const [res, setRes] = useState("");
    const [loading, setLoading] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);

        // Ensure loader shows for at least 500ms
        const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 500));

        const sendEmailPromise = emailjs.sendForm(
            viteemailserviceid,
            viteemailtemplate,
            form.current,
            { publicKey: publicKey }
        );

        Promise.all([minLoadingTime, sendEmailPromise])
            // eslint-disable-next-line no-unused-vars
            .then(([_, result]) => {
                setRes("Order sent successfully!");
            })
            // eslint-disable-next-line no-unused-vars
            .catch((error) => {
                setRes("Failed to send message. Please try again.");
            })
            .finally(() => {
                setLoading(false);
                e.target.reset();
            });
    };


    return (
        <>
            <div className={`w-full md:grid md:grid-cols-2 p-4 pb-[8rem]`}>
                <ImageSlider className={`h-[50vh]`} image_size={`object-cover`} images={presence_eye_lite_images} />
                <div className={`py-8 px-6`}>
                    <h1 className={`text-start mb-10 font-semibold mx-auto md:text-4xl text-2xl`}>
                        Presence Eye <TitleColor text={"Lite"} />
                    </h1>
                    <p className={`text-start md:w-[80%] w-full py-6 md:text-2xl text-xl`}>
                        Choose the perfect fit Smart MultiSocket Extension for your home, with customizable colors and options. Place your order today, or <a href="/contact-us">contact us</a> for more details!
                    </p>
                    <div className={`py-5`}>
                        <button
                            onClick={() => setShowForm(true)}
                            className={`text-white active:scale-110 m-1 p-3 px-4 rounded-full font-medium bg-gradient-to-tr from-[#195C51] via-gray-900  to-[#195C51] hover:bg-gradient-to-tl hover:from-[#195C51] hover:via-gray-900 hover:to-[#195C51] `}
                        >
                            Order now
                        </button>
                        <a href={`/presence-eye/presents`} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-7 active:scale-110 text-base text-body-color font-medium hover:text-gray-700 transition ">
                            Read more →
                        </a>
                    </div>

                    {/* Order Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center">
                            <div className="bg-white text-black p-6 rounded-xl max-w-md w-full shadow-xl relative">
                                <button onClick={() => setShowForm(false)} className="absolute top-2 right-3 text-xl font-bold">&times;</button>
                                <h2 className="text-xl font-semibold mb-4 text-center">Order Smart Extension</h2>
                                <p className={`text-center  w-full py-6 md:text-lg italic`}>
                                    &quot;Starting at just <strong>$55</strong>. Control your Home environment from anywhere in the world by a tap in your phone!&quot;
                                </p>
                                <form ref={form} onSubmit={sendEmail} className="flex flex-col gap-4">
                                    <div className="relative mb-2">
                                        <label htmlFor="name" className="leading-7 text-sm text-gray-600">Name</label>
                                        <input type="text" id="name" name="name"
                                               className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" required/>
                                    </div>
                                    <div className="relative mb-2">
                                        <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
                                        <input type="email" id="email" name="email"
                                               className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" required/>
                                    </div>
                                    <div className="relative mb-2">
                                        <label htmlFor="phone" className="leading-7 text-sm text-gray-600">Phone</label>
                                        <input type="text" id="phone" name="phone"
                                               className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" required/>
                                    </div>
                                    <div className="relative mb-2">
                                        <label htmlFor="message" className="leading-7 text-sm text-gray-600">Message</label>
                                        <textarea id="message" name="message" placeholder="More Details of you order (ie:quantity,color)"
                                                  className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
                                    </div>
                                    {loading ? (
                                        <div className="flex justify-center items-center">
                                            <div
                                                className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#38A368] border-solid"></div>
                                        </div>
                                    ) : (
                                        res && <span className="font-medium text-center text-[#195C51]">{res}</span>
                                    )}
                                    <button type="submit"
                                            className="text-white hover:scale-105 active:scale-125 bg-gradient-to-tr from-[#195C51] via-gray-900 to-[#195C51] border-0 py-2 px-6 focus:outline-none hover:bg-[#38A368] rounded text-lg">
                                        Place Order
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DownloadApp />

            <div
                className={`relative bg-[#121922] text-white bg-center h-[105vh] p-2 bg-cover w-full flex justify-center items-center`}
                style={{
                    backgroundImage: `url(https://res.cloudinary.com/ddsojj7zo/image/upload/v1744275689/byose%20org%20site/mzyjdg98r7xzholutufg.png)`,
                }}
            >
                {/* Dark blur overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 backdrop-blur-md"></div>

                <div className="text-white pb-[15vh] flex flex-col gap-5 z-10">
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
