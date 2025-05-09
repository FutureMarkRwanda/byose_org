// eslint-disable-next-line no-unused-vars
import React, { useRef, useState } from 'react';
import { TbBrandGmail } from "react-icons/tb";
import { FaFacebook, FaGithub, FaInstagram, FaWhatsapp } from "react-icons/fa";
import emailjs from '@emailjs/browser';
import {publicKey, viteemailserviceid, viteemailtemplate} from "../utils/variable.js";
import {Helmet} from "react-helmet";
const image = " /assests/images/wave-haikei.svg";

function ContactUs() {
    const form = useRef();
    const [res, setRes] = useState("");
    const [loading, setLoading] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);

        // Ensure loader shows for at least 500ms
        const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 500));

        const sendEmailPromise = emailjs.sendForm(
            viteemailserviceid,
            viteemailtemplate,
            form.current,
            { publicKey: publicKey }
        );

        Promise.all([minLoadingTime, sendEmailPromise])
            // eslint-disable-next-line no-unused-vars
            .then(([_, result]) => {
                setRes("Message sent successfully!");
            })
            // eslint-disable-next-line no-unused-vars
            .catch((error) => {
                setRes("Failed to send message. Please try again.");
            })
            .finally(() => {
                setLoading(false);
                e.target.reset();
            });
    };

    return (
        <section className="text-gray-600 body-font relative bg-no-repeat" style={{ backgroundImage: `url(${image})` }}>
            <div className="max-w-2xl lg:max-w-4xl mx-auto text-center">
                <h1 className="text-3xl font-extrabold text-gray-900">Visit Us</h1>
                <p className="mt-4 text-lg text-gray-500">
                    We’d love to hear from you! Whether you’re looking to transform your business, collaborate on innovative projects, or simply have questions about our services, the Byose Organization team is here to help.
                </p>
            </div>
            <div className="container bg-white rounded-3xl px-5 py-24 mx-auto flex gap-5 sm:flex-nowrap flex-wrap">
                <form ref={form} onSubmit={sendEmail}
                      className="lg:w-1/3 md:w-1/2 flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0">
                    <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">LEAVE A NOTE</h2>
                    <div className="relative mb-4">
                        <label htmlFor="name" className="leading-7 text-sm text-gray-600">Name</label>
                        <input type="text" id="name" name="name"
                               className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
                        <input type="email" id="email" name="email"
                               className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="phone" className="leading-7 text-sm text-gray-600">Phone</label>
                        <input type="text" id="phone" name="phone"
                               className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="message" className="leading-7 text-sm text-gray-600">Message</label>
                        <textarea id="message" name="message" placeholder="Tell us what you got for us"
                                  className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <div
                                className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#38A368] border-solid"></div>
                        </div>
                    ) : (
                        res && <span className="font-medium text-center text-[#195C51]">{res}</span>
                    )}
                    <button type="submit"
                            className="text-white hover:scale-105 active:scale-125 bg-gradient-to-tr from-[#195C51] via-gray-900 to-[#195C51] border-0 py-2 px-6 focus:outline-none hover:bg-[#38A368] rounded text-lg">
                        Send
                    </button>
                </form>
                {/* Rest of your content */}
                <div
                    className="lg:w-3/5 md:w-1/2 w-full min-h-[700px] bg-gray-300 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31900.393585!2d30.10109!3d-1.9324603613712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca512ea08d8ff%3A0x99e14dfc86cb3c58!2sBYOSE!5e0!3m2!1sen!2srw!4v1736073680108!5m2!1sen!2srw"
                        width="100%" height="100%" className="absolute inset-0 border-0 ml-0 " allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"></iframe>
                    <div className="bg-white relative flex flex-wrap py-6 rounded shadow-md">
                        <div className="lg:w-1/2 px-6">
                            <h2 className="title-font font-bold text-gray-900 tracking-widest text-xs">BYOSE</h2>
                            <p className="mt-1 text-wrap">Build Your Own Solutions Everywhere.</p>
                        </div>
                        <div className="lg:w-1/2  px-6 mt-4 lg:mt-0 flex flex-col gap-3">
                            <a href="mailto:rw.byose@gmail.com"
                               className="#text-[#38A368] leading-relaxed font-medium flex text-wrap gap-5 scale-110"><TbBrandGmail
                                size={20} className={`my-auto text-[#38A368]`}/>rw.byose@email.com</a>
                            <a href="https://wa.me/250792403062"
                               className="#text-[#38A368] leading-relaxed font-medium flex text-wrap gap-5 scale-110"><FaWhatsapp
                                size={20} className={`my-auto text-[#38A368]`}/>+250 792 403 062</a>
                            {/*<a  href="tel:+250792403062" className="#text-[#38A368] leading-relaxed font-medium flex text-wrap gap-5">+250 792 403 062</a>*/}
                            {/*<h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs mt-4">PHONE</h2>*/}
                            <p className="leading-relaxed font-medium text-gray-900 flex flex-row justify-between">
                                <a href="https://www.instagram.com/_.byose._/"
                                   className={`active:scale-110`}><FaInstagram size={23}/></a>
                                <a href={`https://www.facebook.com/profile.php?id=61560100861261`}
                                   className={`active:scale-110`}><FaFacebook size={23}/></a>
                                <a href={`https://github.com/FutureMarkRwanda`} className={`active:scale-110`}><FaGithub
                                    size={23}/></a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ContactUs;
