import React, { useState, useEffect } from 'react';
import ImageSlider from "../ImageSlider.jsx";
import { FaAndroid, FaLinux } from 'react-icons/fa';
import { app_images } from "../../utils/data.js";

function DownloadApp() {
    const [platform, setPlatform] = useState('android'); // Default for visual testing

    return (
        <div className="container mx-auto px-6 py-24">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1">
                    <ImageSlider 
                        className="h-[60vh] md:h-[75vh]" 
                        image_size="object-contain drop-shadow-2xl scale-90 hover:scale-100 transition-transform duration-700" 
                        isbutton={true} 
                        images={app_images} 
                    />
                </div>

                <div className="order-1 lg:order-2 space-y-10">
                    <div className="space-y-4">
                        <h2 className="text-[#195C51] font-bold uppercase tracking-widest text-xs">Seamless Control</h2>
                        <h1 className="text-4xl md:text-5xl font-bold text-[#333333] leading-tight">
                            Your Home, <br/>In your pocket.
                        </h1>
                        <p className="text-lg text-gray-500 font-light leading-relaxed">
                            Manage Power, SmartCharge cycles, and B-Bot interactions from anywhere in the world. Our native applications provide low-latency control over your entire grid.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <a href="https://apkpure.com/presence-eye/com.presenceeye.app" target="_blank" className="google-card p-5 flex items-center gap-4 hover:bg-[#F5F5F5]">
                            <div className="p-3 rounded-xl bg-green-50 text-green-600"><FaAndroid size={24}/></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Available for</p>
                                <p className="font-bold text-[#333333]">Android APK</p>
                            </div>
                        </a>
                        <a href="https://github.com/FutureMarkRwanda/presence-eye-rpm-repo" target="_blank" className="google-card p-5 flex items-center gap-4 hover:bg-[#F5F5F5]">
                            <div className="p-3 rounded-xl bg-orange-50 text-orange-600"><FaLinux size={24}/></div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Available for</p>
                                <p className="font-bold text-[#333333]">Linux RPM</p>
                            </div>
                        </a>
                    </div>

                    <div className="p-6 rounded-3xl bg-[#F5F5F5] border border-gray-100">
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                            <span className="font-bold text-[#195C51]">Note:</span> iOS and Windows desktop versions are currently in the final security audit phase. Sign up for our newsletter to get notified on release.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DownloadApp;