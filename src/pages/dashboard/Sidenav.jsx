import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDownIcon, ArrowLeftOnRectangleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { handleLogout } from "../../utils/helper.js";
import { useMaterialTailwindController, setOpenSidenav } from "../../context/navContext.jsx";

export function Sidenav({ routes }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [controller, dispatch] = useMaterialTailwindController();
    const { openSidenav } = controller;
    const { pathname } = useLocation();

    // Auto-open dropdown if current path is a sub-page
    useEffect(() => {
        routes.forEach(group => {
            group.pages.forEach(page => {
                if (page.isDropdown && page.subPages.some(sub => pathname.includes(sub.path))) {
                    setOpenDropdown(page.name);
                }
            });
        });
    }, [pathname, routes]);

    const toggleDropdown = (name) => {
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <>
            {/* 1. MOBILE OVERLAY (Backdrop) */}
            <div
                className={`fixed inset-0 z-40 h-full w-full bg-black/50 transition-opacity duration-300 xl:hidden ${
                    openSidenav ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setOpenSidenav(dispatch, false)}
            />

            {/* 2. THE SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 my-4 ml-4 w-72 rounded-3xl bg-white border border-gray-100 shadow-xl flex flex-col overflow-hidden transition-transform duration-300 
                ${openSidenav ? "translate-x-0" : "-translate-x-[110%]"} xl:translate-x-0`}
            >
                {/* Header Section */}
                <div className="p-8 border-b border-gray-50 relative">
                    {/* Close button for mobile */}
                    <button 
                        onClick={() => setOpenSidenav(dispatch, false)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full xl:hidden"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>

                    <Link to="/" className="flex items-center gap-3 mb-6" onClick={() => setOpenSidenav(dispatch, false)}>
                        <img src="/assets/icons/Logo03.svg" className="h-8" alt="BYOSE" />
                        <span className="text-xl font-bold text-[#195C51]">BYOSE Admin</span>
                    </Link>
                 
                </div>

                {/* Navigation Section */}
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                    {routes.map(({ title, pages }, key) => (
                        <div key={key} className="mb-6">
                            {title && (
                                <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    {title}
                                </p>
                            )}
                            <ul className="space-y-1">
                                {pages.map((page) => (
                                    <li key={page.name}>
                                        {page.isDropdown ? (
                                            <div>
                                                <button
                                                    onClick={() => toggleDropdown(page.name)}
                                                    className={`flex w-full items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${openDropdown === page.name ? 'bg-[#195C51]/5 text-[#195C51]' : 'text-gray-600 hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {page.icon}
                                                        {page.name}
                                                    </div>
                                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${openDropdown === page.name ? 'rotate-180' : ''}`} />
                                                </button>
                                                {openDropdown === page.name && (
                                                    <ul className="mt-1 ml-9 space-y-1 border-l border-gray-100">
                                                        {page.subPages.map((sub) => (
                                                            <li key={sub.path}>
                                                                <NavLink 
                                                                    to={`/dashboard/${sub.path}`}
                                                                    onClick={() => setOpenSidenav(dispatch, false)} // Close on mobile tap
                                                                >
                                                                    {({ isActive }) => (
                                                                        <span className={`block px-4 py-2 text-xs font-medium rounded-lg transition-colors ${isActive ? 'text-[#195C51] bg-[#195C51]/10 font-bold' : 'text-gray-500 hover:text-[#195C51]'}`}>
                                                                            {sub.name}
                                                                        </span>
                                                                    )}
                                                                </NavLink>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ) : (
                                            <NavLink 
                                                to={`/dashboard/${page.path}`}
                                                onClick={() => setOpenSidenav(dispatch, false)}
                                            >
                                                {({ isActive }) => (
                                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-[#195C51] text-white shadow-lg shadow-[#195C51]/20' : 'text-gray-600 hover:bg-gray-50'}`}>
                                                        {page.icon}
                                                        {page.name}
                                                    </div>
                                                )}
                                            </NavLink>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Footer Section - Logout */}
                <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                    <button 
                        onClick={() => handleLogout("", "/auth")}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidenav;