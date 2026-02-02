import React, { useRef, useState } from 'react';
import { TbBrandGmail, TbMapPin, TbPhone } from "react-icons/tb";
import { FaFacebook, FaGithub, FaInstagram, FaWhatsapp } from "react-icons/fa";
import emailjs from '@emailjs/browser';
import { publicKey, viteemailserviceid, viteemailtemplate } from "../../utils/variable.js";

function ContactUs() {
    const form = useRef();
    const [res, setRes] = useState("");
    const [loading, setLoading] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);
        const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 800));
        const sendEmailPromise = emailjs.sendForm(
            viteemailserviceid,
            viteemailtemplate,
            form.current,
            { publicKey: publicKey }
        );

        Promise.all([minLoadingTime, sendEmailPromise])
            .then(() => {
                setRes("Message sent successfully. We'll be in touch.");
            })
            .catch(() => {
                setRes("Failed to send message. Please try again.");
            })
            .finally(() => {
                setLoading(false);
                e.target.reset();
            });
    };

    return (
        <section className="bg-white min-h-screen pb-20 relative overflow-hidden">
            {/* Background Ethereal Accent */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#195C51]/5 rounded-full blur-[120px] -z-10"></div>

            <div className="container mx-auto px-6 pt-16">
                {/* Header Section */}
                <div className="max-w-3xl mb-20 space-y-4">
                    <h2 className="text-[#195C51] font-bold uppercase tracking-[0.3em] text-sm">Get in Touch</h2>
                    <h1 className="text-5xl md:text-7xl font-bold text-[#333333] leading-tight">
                        Let’s build the <br/> <span className="text-[#195C51]">Future</span> together.
                    </h1>
                    <p className="text-xl text-gray-500 font-light leading-relaxed pt-4">
                        Have a question about PresenceEye or interested in B-Academy? 
                        Our team of innovators is ready to help you navigate the next step in your tech journey.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-16">
                    {/* Left Side: Contact Form */}
                    <div className="lg:col-span-7">
                        <form ref={form} onSubmit={sendEmail} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Your Name</label>
                                    <input type="text" name="name" required placeholder="John Doe"
                                           className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-[#333333] placeholder-gray-400 focus:ring-2 focus:ring-[#195C51] transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                                    <input type="email" name="email" required placeholder="john@example.com"
                                           className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-[#333333] placeholder-gray-400 focus:ring-2 focus:ring-[#195C51] transition-all outline-none" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Message</label>
                                <textarea name="message" required placeholder="Tell us about your project or inquiry..."
                                          className="w-full bg-[#F5F5F5] border-none rounded-3xl p-6 text-[#333333] placeholder-gray-400 focus:ring-2 focus:ring-[#195C51] transition-all outline-none h-48 resize-none"></textarea>
                            </div>

                            <div className="flex items-center gap-6">
                                <button type="submit" disabled={loading}
                                        className="bg-[#195C51] text-white px-12 py-5 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all active:scale-95 disabled:opacity-50">
                                    {loading ? "Sending Pulse..." : "Send Message"}
                                </button>
                                {res && <span className="text-sm font-medium text-[#195C51] animate-fade-in">{res}</span>}
                            </div>
                        </form>
                    </div>

                    {/* Right Side: Info & Map */}
                    <div className="lg:col-span-5 space-y-12">
                        {/* Contact Info Cards */}
                        <div className="grid gap-6">
                            <div className="google-card p-6 flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-[#195C51]/10 flex items-center justify-center text-[#195C51]">
                                    <TbBrandGmail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Email us at</h4>
                                    <p className="text-lg font-medium text-[#333333]">rw.byose@email.com</p>
                                </div>
                            </div>

                            <div className="google-card p-6 flex items-center gap-6">
                                <div className="w-12 h-12 rounded-xl bg-[#195C51]/10 flex items-center justify-center text-[#195C51]">
                                    <FaWhatsapp size={24} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Whatsapp</h4>
                                    <p className="text-lg font-medium text-[#333333]">+250 792 403 062</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Map Container */}
                        <div className="google-card h-80 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-700">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31900.393585!2d30.10109!3d-1.9324603613712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca512ea08d8ff%3A0x99e14dfc86cb3c58!2sBYOSE!5e0!3m2!1sen!2srw!4v1736073680108!5m2!1sen!2srw"
                                width="100%" height="100%" className="border-0" allowFullScreen=""
                                loading="lazy"></iframe>
                        </div>

                        {/* Social Presence */}
                        <div className="space-y-4 pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center lg:text-left">Follow the Innovation</h4>
                            <div className="flex justify-center lg:justify-start gap-4">
                                {[
                                    { icon: FaInstagram, url: "https://www.instagram.com/_.byose._/" },
                                    { icon: FaFacebook, url: "https://www.facebook.com/profile.php?id=61560100861261" },
                                    { icon: FaGithub, url: "https://github.com/FutureMarkRwanda" }
                                ].map((social, idx) => (
                                    <a key={idx} href={social.url} target="_blank" rel="noreferrer"
                                       className="p-4 rounded-2xl bg-[#F5F5F5] text-[#333333] hover:bg-[#195C51] hover:text-white transition-all">
                                        <social.icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ContactUs;