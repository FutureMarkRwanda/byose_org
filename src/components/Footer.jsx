import React from 'react';
import { FaFacebook, FaGithub, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { TbBrandGmail } from "react-icons/tb";

function Footer() {
    return (
        <footer className="bg-[#0B121A] text-white pt-20 pb-10 rounded-t-[3rem]">
            <div className="container px-6 mx-auto">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <a href="/home" className="flex items-center gap-3">
                            <img src="/assets/icons/Logo03.svg" className="h-10" alt="BYOSE Logo" />
                            <span className="text-2xl font-bold tracking-tighter text-white">BYOSE Tech</span>
                        </a>
                        <p className="max-w-md text-gray-400 text-lg font-light leading-relaxed">
                            Transforming ideas into impactful digital solutions by leveraging AI and robotics, 
                            paving the way for a tech-savvy future.
                        </p>
                        <div className="flex gap-4">
                            {[FaInstagram, FaFacebook, FaGithub, FaWhatsapp].map((Icon, idx) => (
                                <a key={idx} href="#" className="p-3 rounded-xl bg-white/5 hover:bg-[#195C51] transition-all border border-white/10">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#195C51] mb-6">Navigation</h3>
                        <div className="flex flex-col space-y-4">
                            {['Home', 'About Us', 'B-Academy', 'PresenceEye'].map((item) => (
                                <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors">{item}</a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#195C51] mb-6">Contact</h3>
                        <div className="flex flex-col space-y-4">
                            <a href="mailto:rw.byose@email.com" className="flex items-center gap-2 text-gray-400 hover:text-white">
                                <TbBrandGmail className="text-[#195C51]" /> rw.byose@email.com
                            </a>
                            <p className="text-gray-400 font-light">Kigali, Rwanda</p>
                        </div>
                    </div>
                </div>

                <hr className="my-12 border-white/10" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm italic">
                        © {new Date().getFullYear()} BYOSE Tech Labs. Build Your Own Solutions Everywhere.
                    </p>
                    <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-500">
                        <a href="#" className="hover:text-white">Privacy Policy</a>
                        <a href="#" className="hover:text-white">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;