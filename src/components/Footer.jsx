// eslint-disable-next-line no-unused-vars
import React from 'react';
import {FaFacebook, FaGithub, FaReddit} from "react-icons/fa";

function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-950">
            <div className="container px-6 py-12 mx-auto">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
                    <div className="sm:col-span-2">
                        <h1 className="max-w-lg text-xl font-semibold tracking-tight text-gray-800 xl:text-2xl dark:text-white">Subscribe
                            our newsletter to get update.</h1>

                        <div className="flex flex-col mx-auto mt-6 space-y-3 md:space-y-0 md:flex-row">
                            <input id="email" type="text"
                                   className="px-4 py-2 text-gray-700 bg-white border rounded-md dark:bg-gray-950 dark:text-gray-300 dark:border-gray-600 focus:border-[#65E4A3] dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-blue-300"
                                   placeholder="Email Address"/>

                                <button
                                    className="w-full px-6 py-2.5 text-sm font-medium tracking-wider text-white transition-colors duration-300 transform md:w-auto md:mx-4 focus:outline-none bg-gray-800 rounded-lg hover:bg-gray-700 focus:ring focus:ring-gray-300 focus:ring-opacity-80">
                                    Subscribe
                                </button>
                        </div>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">Quick Link</p>

                        <div className="flex flex-col items-start mt-5 space-y-2">
                            <a href="/home"
                               className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-[#65E4A3] hover:underline hover:text-[#38A368]">Home</a>
                            <a href="/we-are"
                               className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-[#65E4A3] hover:underline hover:text-[#38A368]">Who
                                We Are</a>
                            <a href="/"
                               className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-[#65E4A3] hover:underline hover:text-[#38A368]">Our
                                Philosophy</a>
                        </div>
                    </div>

                    <div>
                        <p className="font-semibold text-gray-800 dark:text-white">Industries</p>

                        <div className="flex flex-col items-start mt-5 space-y-2">
                            <a
                               className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-[#65E4A3] hover:underline hover:text-[#38A368]">Commerce</a>
                            <a
                               className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-[#65E4A3] hover:underline hover:text-[#38A368]">Information
                                Technology</a>
                            <a href="https://b-academy.vercel.app"
                               className="text-gray-600 transition-colors duration-300 dark:text-gray-300 dark:hover:text-[#65E4A3] hover:underline hover:text-[#38A368]">E Courses</a>
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-gray-200 md:my-8 dark:border-gray-700"/>

                    <div className="flex items-center justify-between">
                        <a href="/home" className="flex items-center space-x-3 rtl:space-x-reverse">
                            <img src="/assets/icons/Logo03.svg" className="h-8" alt="Flowbite Logo"/>
                            <span
                                className="self-center text-2xl font-semibold whitespace-nowrap text-white">BYOSE</span>
                        </a>
                        <div className="flex -mx-2 text-2xl">
                            <a href="#"
                               className="mx-2 text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-[#38A368] dark:hover:text-[#65E4A3]"
                               aria-label="Reddit">
                                <FaReddit />
                            </a>

                            <a href="#"
                               className="mx-2 text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-[#38A368] dark:hover:text-[#65E4A3]"
                               aria-label="Facebook"><FaFacebook />
                            </a>

                            <a href="#"
                               className="mx-2 text-gray-600 transition-colors duration-300 dark:text-gray-300 hover:text-[#38A368] dark:hover:text-[#65E4A3]">
                                <FaGithub />
                            </a>
                        </div>
                    </div>
            </div>
        </footer>
)
}

export default Footer;