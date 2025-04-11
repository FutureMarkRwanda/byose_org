import React, { useState, useEffect } from 'react';
import ImageSlider from "../ImageSlider.jsx";
import { FaAndroid, FaApple, FaWindows, FaLinux, FaDownload } from 'react-icons/fa';
import { BiError } from 'react-icons/bi';
import {app_images} from "../../utils/data.js";

function DownloadApp() {
    const [platform, setPlatform] = useState('unknown');

    useEffect(() => {
        // Detect the user's platform
        const detectPlatform = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();

            if (/android/i.test(userAgent)) {
                setPlatform('android');
            } else if (/iphone|ipad|ipod/i.test(userAgent)) {
                setPlatform('ios');
            } else if (/windows/i.test(userAgent)) {
                setPlatform('windows');
            } else if (/linux/i.test(userAgent)) {
                setPlatform('linux');
            } else if (/macintosh|mac os/i.test(userAgent)) {
                setPlatform('mac');
            } else {
                setPlatform('unknown');
            }
        };

        detectPlatform();
    }, []);

    const getPlatformSpecificContent = () => {
        switch (platform) {
            case 'android':
                return {
                    icon: <FaAndroid className="mr-2"  size={26}/>,
                    text: "Download for your Android",
                    url: "https://apkpure.com/presence-eye/com.presenceeye.app",
                    available: true,
                    apps:[
                        {
                            name: "Presence Eye Latest",
                            url: "https://www.dropbox.com/scl/fi/krl4tfbjsg5h5wj7r5ijc/presence-eye-v1.2.2.apk?rlkey=d0jm6xvtph7q8m4vdkiih4rx1&st=xee34lcs&dl=0",
                            icon: ""
                        },
                        {
                            name: "Presence Eye",
                            url: "https://apkpure.com/presence-eye/com.presenceeye.app",
                            icon: ""
                        },
                        {
                            name: "Charge My Device",
                            url: "https://apkpure.com/charge-my-device/com.charge_my_device.app",
                            icon: ""
                        }
                    ]
                };
            // case 'ios':
            //     return {
            //         icon: <FaApple className="mr-2" />,
            //         text: "Download for your iPhone",
            //         url: "/downloads/ios",
            //         available: true
            //     };
            // case 'windows':
            //     return {
            //         icon: <FaWindows className="mr-2" />,
            //         text: "Download for Windows",
            //         url: "/downloads/windows",
            //         available: true
            //     };
            case 'linux':
                return {
                    icon: <FaLinux className="mr-2" size={26} />,
                    text: "Download for Linux",
                    url: "/downloads/linux",
                    available: true,
                    apps:[
                        {
                            name: "Presence Eye",
                            url: "https://github.com/FutureMarkRwanda/presence-eye-rpm-repo#presence-eye-rpm-repository",
                            icon: ""
                        },
                        {
                            name: "Charge My Device",
                            url: "https://github.com/FutureMarkRwanda/charge-my-device-rpm-repo?tab=readme-ov-file#charge-my-device-rpm-repository",
                            icon: ""
                        }
                    ]
                };
            // case 'mac':
            //     return {
            //         icon: <FaApple className="mr-2" />,
            //         text: "Download for macOS",
            //         url: "/downloads/mac",
            //         available: true
            //     };
            default:
                return {
                    icon: <BiError className="mr-2" />,
                    text: "We're still perfecting it to bring you the best experience. In the meantime, please access it on other devices like Android.\n",
                    url: "/downloads/notify",
                    available: false
                };
        }
    };

    const platformContent = getPlatformSpecificContent();

    return (
        <div className="w-full md:grid grid-cols-2 gap-8 py-5 bg-gray-100 p-4">
            <div className="py-8 px-10">
                <h1 className="text-start mb-10 font-semibold mx-auto md:text-4xl text-2xl">
                    Control Your Home Anytime, Anywhere
                </h1>
                <p className="text-start md:w-4/5 w-full py-6 md:text-2xl text-xl">
                    Take control of your smart home from anywhere with our intuitive app. Manage power, temperature, lights, and more with just a few taps. Experience the future of home automation today!
                </p>

                <div className="p-5 flex md:flex-row flex-col gap-1.5">
                    {platformContent.available ? (
                        platformContent.apps.map((platform, index) => (
                            <a key={index}
                                href={platform.url}
                               target="_blank"
                                className="flex items-center justify-center md:justify-start text-white active:scale-110 p-3 px-6 rounded-full font-medium bg-gradient-to-tr from-teal-700 via-gray-900 to-teal-700 hover:bg-gradient-to-tl hover:from-teal-700 hover:via-gray-900 hover:to-teal-700 max-w-xs"
                            >
                                {platformContent.icon}
                                {platform.name}
                            </a>
                        ))
                    ) : (
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center text-amber-600 font-medium">
                                {platformContent.icon}
                                {platformContent.text}
                            </div>
                            <a
                                href={platformContent.url}
                                className="flex items-center justify-center md:justify-start text-white active:scale-110 p-3 px-6 rounded-full font-medium bg-gradient-to-tr from-teal-700 via-gray-900 to-teal-700 hover:bg-gradient-to-tl hover:from-teal-700 hover:via-gray-900 hover:to-teal-700 max-w-xs"
                            >
                                <FaDownload className="mr-2" />
                                Notify me when available
                            </a>
                        </div>
                    )}
                    {/*<div className="flex flex-wrap gap-2 pt-3">*/}
                    {/*    <a href="/presence-eye/lite/presents" className="text-white active:scale-110 p-3 px-4 rounded-full font-medium bg-gradient-to-tr from-teal-700 via-gray-900 to-teal-700 hover:bg-gradient-to-tl hover:from-teal-700 hover:via-gray-900 hover:to-teal-700">*/}
                    {/*        Order now*/}
                    {/*    </a>*/}
                    {/*    <a href="/presence-eye/presents" target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-4 active:scale-110 text-base text-gray-700 font-medium hover:text-gray-900 transition">*/}
                    {/*        Take a closer look*/}
                    {/*    </a>*/}
                    {/*    <a href="/presence-eye/presents" target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-4 active:scale-110 text-base text-gray-700 font-medium hover:text-gray-900 transition">*/}
                    {/*        Read more →*/}
                    {/*    </a>*/}
                    {/*</div>*/}
                </div>
            </div>
            <div className="flex items-center justify-center">
                <ImageSlider className="h-[70vh]" image_size="object-contain rotate-12 p-2 hover:rotate-0 transition-transform duration-300" isbutton={true} images={app_images}/>
            </div>
        </div>
    );
}

export default DownloadApp;