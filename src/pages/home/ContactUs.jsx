// src/pages/home/ContactUs.jsx
import React, { useRef, useState } from 'react';
import { TbBrandGmail, TbMapPin, TbSend } from "react-icons/tb";
import { FaGithub, FaInstagram, FaWhatsapp } from "react-icons/fa";
import emailjs from '@emailjs/browser';
import { publicKey, viteemailserviceid, viteemailtemplate } from "../../utils/variable.js";

function ContactUs() {
    const form = useRef();
    const [res, setRes]         = useState("");
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState({});
    const [filled,  setFilled]  = useState({});

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);
        emailjs
            .sendForm(viteemailserviceid, viteemailtemplate, form.current, { publicKey })
            .then(() => setRes("Message sent successfully."))
            .catch(() => setRes("Failed to send message. Please try again."))
            .finally(() => {
                setLoading(false);
                e.target.reset();
                setFilled({});
            });
    };

    const handleFocus = (name) => setFocused(p => ({ ...p, [name]: true }));
    const handleBlur  = (name, val) => {
        setFocused(p => ({ ...p, [name]: false }));
        setFilled(p => ({ ...p, [name]: val.trim().length > 0 }));
    };

    const isFloating = (name) => focused[name] || filled[name];

    return (
        <section className="min-h-screen bg-gradient-to-br from-[#0B121A] via-[#0e1c17] to-[#111827] relative overflow-hidden flex items-center justify-center py-20 my-10 px-4">

            {/* ── Decorative blobs ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#195C51]/20 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#195C51]/10 blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[#195C51]/5 blur-[150px]" />
                {/* Dot grid */}
                <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{ backgroundImage: 'radial-gradient(#195C51 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                />
            </div>

            {/* ── Card ── */}
            <div className="relative z-10 w-full max-w-5xl">

                {/* Top label */}
                <p className="text-center text-[#195C51] font-black uppercase tracking-[0.35em] text-[11px] mb-4">
                    Get in touch
                </p>
                <h1 className="text-center text-white font-bold text-4xl md:text-5xl mb-12 leading-tight">
                    Let's start a <span className="text-[#2DC87A]">conversation.</span>
                </h1>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid lg:grid-cols-5">

                    {/* ── LEFT: contact info ── */}
                    <div className="lg:col-span-2 bg-[#195C51]/90 backdrop-blur-sm p-8 md:p-10 flex flex-col justify-between gap-10 relative overflow-hidden">
                        {/* Decorative ring */}
                        <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full border-2 border-white/10" />
                        <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full border border-white/10" />

                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2 leading-snug">
                                Contact<br/>Information
                            </h2>
                            <p className="text-white/50 text-sm">
                                Fill in the form and we will get back to you within 24 hours.
                            </p>
                        </div>

                        <div className="space-y-7 relative z-10">
                            {[
                                { icon: TbBrandGmail,  label: 'Email',    value: 'rw.byose@gmail.com' },
                                { icon: FaWhatsapp,    label: 'WhatsApp', value: '+250 798 736 159' },
                                { icon: TbMapPin,      label: 'HQ',       value: 'Kigali, Rwanda' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white group-hover:bg-white/25 transition-colors flex-shrink-0">
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</p>
                                        <p className="text-sm font-semibold text-white">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Social icons */}
                        <div className="flex gap-3 relative z-10">
                            {[
                                { Icon: FaInstagram, url: 'https://www.instagram.com/_.byose._/' },
                                { Icon: FaGithub,    url: 'https://github.com/FutureMarkRwanda' },
                            ].map(({ Icon, url }, i) => (
                                <a key={i} href={url} target="_blank" rel="noreferrer"
                                   className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: form ── */}
                    <div className="lg:col-span-3 p-8 md:p-12">
                        <p className="text-white/60 text-sm italic mb-10 leading-relaxed">
                            "Solving the world's problems starts with a single message. Tell us what you're building."
                        </p>

                        <form ref={form} onSubmit={sendEmail} className="space-y-8">

                            {/* Row: Name + Email */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { name: 'name',  type: 'text',  label: 'Full Name' },
                                    { name: 'email', type: 'email', label: 'Email Address' },
                                ].map(({ name, type, label }) => (
                                    <div key={name} className="relative">
                                        <label
                                            className={`absolute left-0 pointer-events-none transition-all duration-200 font-semibold
                                                ${isFloating(name)
                                                    ? 'top-[-18px] text-[10px] uppercase tracking-widest text-[#2DC87A]'
                                                    : 'top-3 text-sm text-white/50'
                                                }`}
                                        >
                                            {label}
                                        </label>
                                        <input
                                            type={type}
                                            name={name}
                                            required
                                            onFocus={() => handleFocus(name)}
                                            onBlur={e => handleBlur(name, e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-white/20 py-3 outline-none focus:border-[#2DC87A] transition-colors text-white text-sm font-medium placeholder-transparent"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Subject */}
                            <div className="relative">
                                <label
                                    className={`absolute left-0 pointer-events-none transition-all duration-200 font-semibold
                                        ${isFloating('subject')
                                            ? 'top-[-18px] text-[10px] uppercase tracking-widest text-[#2DC87A]'
                                            : 'top-3 text-sm text-white/50'
                                        }`}
                                >
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    onFocus={() => handleFocus('subject')}
                                    onBlur={e => handleBlur('subject', e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-white/20 py-3 outline-none focus:border-[#2DC87A] transition-colors text-white text-sm font-medium"
                                />
                            </div>

                            {/* Message */}
                            <div className="relative">
                                <label
                                    className={`pointer-events-none transition-all duration-200 font-semibold block mb-2
                                        ${isFloating('message')
                                            ? 'text-[10px] uppercase tracking-widest text-[#2DC87A]'
                                            : 'text-sm text-white/50'
                                        }`}
                                >
                                    Your Message
                                </label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    onFocus={() => handleFocus('message')}
                                    onBlur={e => handleBlur('message', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-[#2DC87A] focus:bg-white/8 transition-all resize-none text-white text-sm font-medium placeholder-white/20"
                                    placeholder="Tell us what's on your mind…"
                                />
                            </div>

                            {/* Submit row */}
                            <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full sm:w-auto bg-[#2DC87A] hover:bg-[#26ae6a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black px-10 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#2DC87A]/20 hover:shadow-[#2DC87A]/40 transition-all active:scale-95"
                                >
                                    <span>{loading ? 'Transmitting…' : 'Send Message'}</span>
                                    <TbSend
                                        size={18}
                                        className={`transition-transform ${loading ? 'animate-pulse' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`}
                                    />
                                </button>

                                {res && (
                                    <span
                                        className={`text-xs font-black uppercase tracking-widest animate-pulse
                                            ${res.startsWith('Message sent') ? 'text-[#2DC87A]' : 'text-red-400'}`}
                                    >
                                        {res}
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ContactUs;