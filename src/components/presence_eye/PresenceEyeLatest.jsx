import { useRef, useState } from 'react';
import ImageSlider from "../ImageSlider.jsx";
import DownloadApp from "./DownloadApp.jsx";
import { presence_eye_lite_images } from "../../utils/data.js";
import emailjs from "@emailjs/browser";
import { publicKey, viteemailserviceid, viteemailtemplate } from "../../utils/variable.js";
import Video from "../Video.jsx";
import { MdClose, MdAutoAwesome } from "react-icons/md";
// import Buttons3D from './Buttons3D.jsx';

function PresenceEyeLatest() {
    const [showForm, setShowForm] = useState(false);
    const form = useRef();
    const [res, setRes] = useState("");
    const [loading, setLoading] = useState(false);

    const sendEmail = (e) => {
        e.preventDefault();
        setLoading(true);
        emailjs.sendForm(viteemailserviceid, viteemailtemplate, form.current, { publicKey })
            .then(() => setRes("Order pulse sent. We'll contact you soon."))
            .catch(() => setRes("Sync failed. Please try again."))
            .finally(() => { setLoading(false); e.target.reset(); });
    };

    return (
        <div className="space-y-32 py-6">
            {/* Product Showcase */}
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="google-card p-2 bg-[#F5F5F5] overflow-hidden">
                        <ImageSlider className="h-[50vh] md:h-[60vh]" image_size="object-cover" images={presence_eye_lite_images} />
                    </div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#195C51]/10 text-[#195C51] text-xs font-bold uppercase tracking-widest">
                            <MdAutoAwesome /> Smart Extension
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-[#333333]">
                            PresenceEye <span className="text-[#195C51]">Lite</span>
                        </h2>
                        <p className="text-xl text-gray-500 font-light leading-relaxed max-w-lg">
                            Elevate your power management. A precision-engineered multisocket extension that bridges the gap between manual control and AI automation.
                        </p>
                       
                    </div>

                </div>
            </div>

            {/* Video Feature */}
            <section className="bg-[#F5F5F5] py-24 rounded-[4rem] mx-4">
                <div className="container mx-auto px-6 text-center space-y-12">
                    <h3 className="text-2xl font-bold text-[#333333]">See it in action</h3>
                    <Video url="https://www.youtube.com/watch?v=DybOjpvrGY8" />
                </div>
            </section>

            <DownloadApp />

            {/* Futuristic CTA Footer */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden rounded-[4rem] mx-4 mb-10 bg-[#0B121A]">
                <div className="absolute inset-0 opacity-40">
                    <img src="https://res.cloudinary.com/ddsojj7zo/image/upload/v1744275689/byose%20org%20site/mzyjdg98r7xzholutufg.png" className="w-full h-full object-cover blur-sm" alt="" />
                </div>
                <div className="relative z-10 text-center space-y-6 px-6">
                    <h4 className="text-[#195C51] font-black uppercase tracking-[0.4em] text-xs">Autonomous Living</h4>
                    <h1 className="text-5xl md:text-8xl font-bold text-white leading-none tracking-tighter">
                        Turn Every Room <br/> Into a <span className="text-[#195C51]">Genius.</span>
                    </h1>
                </div>
            </div>

            {/* Order Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#0B121A]/80 backdrop-blur-md" onClick={() => setShowForm(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-[#333333]">Reserve Yours</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-black"><MdClose size={24}/></button>
                        </div>
                        <form ref={form} onSubmit={sendEmail} className="p-8 space-y-4">
                            <input type="text" name="name" placeholder="Full Name" required className="w-full bg-[#F5F5F5] rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#195C51]/10" />
                            <input type="email" name="email" placeholder="Email Address" required className="w-full bg-[#F5F5F5] rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#195C51]/10" />
                            <input type="text" name="phone" placeholder="Phone Number" required className="w-full bg-[#F5F5F5] rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#195C51]/10" />
                            <textarea name="message" placeholder="Details (Quantity, Color preference...)" className="w-full bg-[#F5F5F5] rounded-3xl p-4 text-sm outline-none h-32 resize-none"></textarea>
                            <button type="submit" disabled={loading} className="w-full bg-[#195C51] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#0E3A32] transition-all">
                                {loading ? "Syncing Order..." : "Confirm Order — $55"}
                            </button>
                            {res && <p className="text-center text-xs font-bold text-[#195C51] uppercase tracking-widest">{res}</p>}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PresenceEyeLatest;