import { useRef, useState } from 'react';
import emailjs from "@emailjs/browser";
import { publicKey, viteemailserviceid, viteemailtemplate } from "../../utils/variable.js";
import { MdClose } from "react-icons/md";
import ButtonsPage from './ButtonsPage.jsx';

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
            {/* Buttons Product Card */}
             <ButtonsPage/>

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