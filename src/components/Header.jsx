import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LuMessageCircleQuestion } from "react-icons/lu";

function Header() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getActiveClass = (path) => 
        location.pathname === path ? 'text-[#195C51] font-semibold' : 'text-[#333333] hover:text-[#195C51]';

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-6'}`}>
            <div className={`mx-auto max-w-7xl px-4`}>
                <div className={`glass-header rounded-full px-8 py-3 flex items-center justify-between shadow-sm`}>
                    <Link to="/home" className="flex items-center gap-2">
                        <img src="/assets/icons/Logo01.svg" className="h-8 w-8" alt="BYOSE Logo" />
                        <span className="text-xl font-bold tracking-tight text-[#195C51]">BYOSE</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {['/', '/services', '/we-are', '/presence-eye'].map((path) => (
                            <Link 
                                key={path} 
                                to={path} 
                                className={`text-sm font-medium uppercase tracking-wider ${getActiveClass(path)}`}
                            >
                                {path === '/' ? 'Home' : path.replace('/', '').replace('-', ' ')}
                            </Link>
                        ))}
                    </div>

                    <Link 
                        to="/contact" 
                        className="bg-[#195C51] text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#0E3A32] shadow-md active:scale-95"
                    >
                        Get in Touch <LuMessageCircleQuestion />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Header;