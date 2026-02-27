import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LuMessageCircleQuestion } from "react-icons/lu";
import { MdMenu, MdClose } from "react-icons/md"; // Added icons for mobile

function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const getActiveClass = (path) => 
        location.pathname === path ? 'text-[#195C51] font-semibold' : 'text-[#333333] hover:text-[#195C51]';

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
        { name: 'Who We Are', path: '/we-are' },
        { name: 'Presence Eye', path: '/presence-eye' }
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-2' : 'py-6'}`}>
            <div className="mx-auto max-w-7xl px-4">
                <div className="glass-header rounded-full px-6 md:px-8 py-3 flex items-center justify-between shadow-sm relative z-50">
                    
                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/assets/icons/Logo01.svg" className="h-7 w-7 md:h-8 md:w-8" alt="BYOSE Logo" />
                        <span className="text-lg md:text-xl font-bold tracking-tight text-[#195C51]">BYOSE</span>
                    </Link>

                    {/* DESKTOP LINKS (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                className={`text-sm font-medium uppercase tracking-wider transition-colors ${getActiveClass(link.path)}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* ACTIONS: Desktop Button & Mobile Toggle */}
                    <div className="flex items-center gap-2">
                        <Link 
                            to="/contact" 
                            className="hidden sm:flex bg-[#195C51] text-white px-5 py-2 rounded-full text-xs md:text-sm font-medium items-center gap-2 hover:bg-[#0E3A32] shadow-md active:scale-95"
                        >
                            Get in Touch <LuMessageCircleQuestion />
                        </Link>

                        {/* Hamburger Button (Mobile Only) */}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 md:hidden text-[#195C51] hover:bg-gray-100 rounded-full transition-colors"
                        >
                            {mobileMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
                        </button>
                    </div>
                </div>

                {/* MOBILE MENU OVERLAY */}
                <div className={`fixed inset-0 bg-white z-40 transition-all duration-500 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="flex flex-col items-center justify-center h-full space-y-8 p-6">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                className={`text-3xl font-bold tracking-tighter ${location.pathname === link.path ? 'text-[#195C51]' : 'text-gray-400'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link 
                            to="/contact" 
                            className="w-full text-center bg-[#195C51] text-white py-5 rounded-[2rem] text-xl font-bold shadow-2xl"
                        >
                            Get in Touch
                        </Link>
                        
                        {/* Decorative Background for Mobile Menu */}
                        <div className="absolute bottom-10 opacity-10 -z-10">
                            <img src="/assets/icons/Logo01.svg" className="w-40 h-40" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Header;