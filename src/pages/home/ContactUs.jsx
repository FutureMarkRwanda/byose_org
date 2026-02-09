import React, { useRef, useState } from 'react';
import { TbBrandGmail, TbMapPin, TbPhone, TbSend } from "react-icons/tb";
import { FaGithub, FaInstagram, FaWhatsapp } from "react-icons/fa";
import emailjs from '@emailjs/browser';
import { publicKey, viteemailserviceid, viteemailtemplate } from "../../utils/variable.js";

function ContactUs() {
    const form = useRef();
    const [res, setRes] = useState("");
    const [loading, setLoading] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);
        emailjs.sendForm(viteemailserviceid, viteemailtemplate, form.current, { publicKey: publicKey })
            .then(() => setRes("Message sent successfully."))
            .catch(() => setRes("Failed to send message."))
            .finally(() => {
                setLoading(false);
                e.target.reset();
            });
    };

    return (
        <section className="bg-[#F8F9FA] min-h-screen pb-20 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#195C51]/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-[#195C51]/10 rounded-full blur-[100px]"></div>

            <div className="container mx-auto px-6 pt-12">
                <div className="google-card overflow-hidden border-none shadow-2xl bg-white rounded-[3rem] grid lg:grid-cols-12 min-h-[80vh]">
                    
                    {/* LEFT SIDE: DARK INFO PANEL */}
                    <div className="lg:col-span-4 bg-[#0B121A] p-10 md:p-16 text-white flex flex-col justify-between relative overflow-hidden">
                        {/* Abstract Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#195C51 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <h2 className="text-[#195C51] font-black uppercase tracking-[0.3em] text-xs">Reach Out</h2>
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tighter">
                                    Let’s start a <span className="text-[#195C51]">conversation.</span>
                                </h1>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#195C51] border border-white/10 group-hover:bg-[#195C51] group-hover:text-white transition-all">
                                        <TbBrandGmail size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email</p>
                                        <p className="text-lg font-medium text-gray-200">rw.byose@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#195C51] border border-white/10 group-hover:bg-[#195C51] group-hover:text-white transition-all">
                                        <FaWhatsapp size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Whatsapp</p>
                                        <p className="text-lg font-medium text-gray-200">+250 798 736 159</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#195C51] border border-white/10 group-hover:bg-[#195C51] group-hover:text-white transition-all">
                                        <TbMapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">HQ</p>
                                        <p className="text-lg font-medium text-gray-200">Kigali, Rwanda</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 pt-12 flex gap-4">
                            {[
                                { icon: FaInstagram, url: "https://www.instagram.com/_.byose._/" },
                                { icon: FaGithub, url: "https://github.com/FutureMarkRwanda" }
                            ].map((social, idx) => (
                                <a key={idx} href={social.url} target="_blank" rel="noreferrer"
                                   className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#195C51] transition-all">
                                    <social.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT SIDE: FORM AREA */}
                    <div className="lg:col-span-8 p-10 md:p-20 bg-white">
                        <div className="max-w-2xl">
                            <p className="text-gray-400 font-medium mb-12 italic text-lg">
                                "Solving the world's problems starts with a single message. Tell us what you're building."
                            </p>

                            <form ref={form} onSubmit={sendEmail} className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="relative group">
                                        <input type="text" name="name" required 
                                               className="w-full bg-transparent border-b-2 border-gray-100 py-3 outline-none focus:border-[#195C51] transition-colors peer text-gray-800 font-medium" />
                                        <label className="absolute left-0 top-3 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#195C51] peer-valid:-top-4 peer-valid:text-[10px]">Full Name</label>
                                    </div>
                                    <div className="relative group">
                                        <input type="email" name="email" required 
                                               className="w-full bg-transparent border-b-2 border-gray-100 py-3 outline-none focus:border-[#195C51] transition-colors peer text-gray-800 font-medium" />
                                        <label className="absolute left-0 top-3 text-gray-400 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[10px] peer-focus:font-black peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-[#195C51] peer-valid:-top-4 peer-valid:text-[10px]">Email Address</label>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <textarea name="message" required 
                                              className="w-full bg-[#F8F9FA] rounded-3xl p-6 outline-none focus:ring-2 focus:ring-[#195C51]/20 transition-all h-40 resize-none text-gray-800"></textarea>
                                    <label className="absolute left-6 top-6 text-gray-400 pointer-events-none transition-all group-focus-within:-top-4 group-focus-within:left-2 group-focus-within:text-[10px] group-focus-within:font-black group-focus-within:uppercase group-focus-within:text-[#195C51]">Your Message</label>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <button type="submit" disabled={loading}
                                            className="w-full sm:w-auto bg-[#195C51] text-white px-12 py-5 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                        {loading ? "Transmitting..." : <>Send Pulse <TbSend size={20}/></>}
                                    </button>
                                    {res && <span className="text-sm font-black uppercase tracking-widest text-[#195C51] animate-pulse">{res}</span>}
                                </div>
                            </form>
                        </div>

                        {/* Integrated Map Preview (Small & Subtle) */}
                        <div className="mt-20 opacity-50 hover:opacity-100 transition-opacity">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-4">Network Node: Kigali/RW</h4>
                            <div className="h-48 rounded-[2rem] overflow-hidden grayscale border border-gray-100">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.507959722124!2d30.058176301332598!3d-1.9499429990886152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4260034b84f%3A0xca04c4970ca3e25a!2sKN%204%20Ave%2C%20Kigali!5e0!3m2!1sen!2srw!4v1770418428525!5m2!1sen!2srw"
                                    width="100%" height="100%" className="border-0" allowFullScreen="" loading="lazy"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ContactUs;