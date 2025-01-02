// eslint-disable-next-line no-unused-vars
import React from 'react';
const image = " /assests/images/wave-haikei.svg";

function ContactUs() {
    return (
        // eslint-disable-next-line no-undef
        <section className="text-gray-600 body-font relative bg-no-repeat" style={{backgroundImage:`url(${image})`}}>
            <div className="max-w-2xl lg:max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">Visit Us</h2>
                <p className="mt-4 text-lg text-gray-500">We’d love to hear from you! Whether you’re looking to
                    transform your business, collaborate on innovative projects, or simply have questions about our
                    services, the Byose Organization team is here to help.</p>
            </div>
            <div className="container bg-white rounded-3xl px-5 py-24 mx-auto flex  gap-5 sm:flex-nowrap flex-wrap">
                <div className="lg:w-1/3 md:w-1/2 flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0">
                    <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">LEAVE A NOTE</h2>
                    {/*<p className="leading-relaxed mb-5 text-gray-600">Post-ironic portland shabby chic echo park, banjo*/}
                    {/*    fashion axe*/}
                    {/*</p>*/}
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
                        <label htmlFor="email" className="leading-7 text-sm text-gray-600">Phone</label>
                        <input type="email" id="email" name="email"
                               className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="message" className="leading-7 text-sm text-gray-600">Message</label>
                        <textarea
                            id="message"
                            name="message" placeholder={`Tell us  what you got for us`}
                            className="w-full bg-white rounded border border-gray-300 focus:border-[#38A368] focus:ring-2 focus:ring-red-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
                    </div>
                    <button
                        className="text-white hover:scale-105 active:scale-125 bg-gradient-to-tr from-[#195C51] via-gray-900  to-[#195C51]  border-0 py-2 px-6 focus:outline-none hover:bg-[#38A368] rounded text-lg">Button
                    </button>
                    {/*<p className="text-xs text-gray-500 mt-3">Chicharrones blog helvetica normcore iceland tousled brook*/}
                    {/*    viral*/}
                    {/*    artisan.</p>*/}
                </div>
                <div
                    className="lg:w-3/5 md:w-1/2 bg-gray-300 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative">
                    <iframe width="100%" height="100%" className="absolute inset-0 border-0 ml-0 "
                            marginWidth="0" scrolling="no"
                            src="https://maps.google.com/maps?width=100%&height=600&hl=en&q=%C4%B0zmir+(My%20Business%20Name)&ie=UTF8&t=&z=14&iwloc=B&output=embed"
                    ></iframe>
                    <div className="bg-white relative flex flex-wrap py-6 rounded shadow-md">
                        <div className="lg:w-1/2 px-6">
                            <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs">ADDRESS</h2>
                            <p className="mt-1">Photo booth tattooed prism, portland taiyaki hoodie neutra
                                typewriter</p>
                        </div>
                        <div className="lg:w-1/2 px-6 mt-4 lg:mt-0">
                            <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs">EMAIL</h2>
                            <a className="text-[#38A368] leading-relaxed">example@email.com</a>
                            <h2 className="title-font font-semibold text-gray-900 tracking-widest text-xs mt-4">PHONE</h2>
                            <p className="leading-relaxed">123-456-7890</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ContactUs;
