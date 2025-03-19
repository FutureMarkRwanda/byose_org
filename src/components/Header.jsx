import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {LuMessageCircleQuestion} from "react-icons/lu"; // Import useLocation hook

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation(); // Get the current location

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const getActiveClass = (path) => {
        return location.pathname === path
            ? 'text-[#38A368] ' // Active link class
            : 'text-white'; // Inactive link class
    };

    return (
        <nav className="border-gray-200 bg-gray-950 mt-8 md:container w-[95%] md:mx-auto ml-3 md:rounded-3xl bg-opacity-95 rounded shadow-xl fixed z-50">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a href="/home" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="/assests/icons/Logo03.svg" className="h-8" alt="Flowbite Logo" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">BYOSE</span>
                </a>
                <div className="flex md:order-2">
                    <button
                        type="button"
                        className="md:hidden text-gray-400 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-700 rounded-lg text-sm p-2.5 me-1"
                        onClick={toggleMenu}
                    >
                        <svg
                            className="w-5 h-5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M1 1h15M1 7h15M1 13h15"
                            />
                        </svg>
                        <span className="sr-only">Open main menu</span>
                    </button>
                </div>
                <div
                    className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
                        menuOpen ? '' : 'hidden'
                    }`}
                    id="navbar-search"
                >
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 border-gray-700">
                        <li>
                            <a
                                href="/home"
                                className={`block py-2 px-3 rounded md:p-0 md:hover:text-[#38A368] ${getActiveClass('/home')}`}
                            >
                                Home
                            </a>
                        </li>
                        <li>
                            <a
                                href="/"
                                className={`block py-2 px-3 rounded md:p-0 md:hover:text-[#38A368] ${getActiveClass('/')}`}
                            >
                                About
                            </a>
                        </li>
                        <li>
                            <a
                                href="/#services"
                                className={`block py-2 px-3 rounded md:p-0 md:hover:text-[#38A368] ${getActiveClass('/#servicesz')}`}
                            >
                                Services
                            </a>
                        </li>
                        <li>
                            <a
                                href="/we-are"
                                className={`block py-2 px-3 rounded md:p-0 md:hover:text-[#38A368] ${getActiveClass('/we-are')}`}
                            >
                                Who we are
                            </a>
                        </li>
                        <li>
                            <a
                                href="/presence-eye"
                                className={`block py-2 px-3 rounded md:p-0 md:hover:text-[#38A368] ${getActiveClass('/presence-eye')}`}
                            >
                                Presence Eye
                            </a>
                        </li>
                        <li>
                            <a
                                href="/contact"
                                className={`block flex text-wrap gap-3  py-2 px-3 rounded md:p-0 md:hover:text-[#38A368] ${getActiveClass('/contact')}`}
                            >
                                Get in Touch<LuMessageCircleQuestion size={20} />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Header;
