import React, { useState } from 'react';
import { returnToken, sendData } from "../utils/helper.js";
import { presence_server } from "../config/server_api.js";
import { MdClose, MdOutlineBolt, MdMemory, MdSettingsSuggest } from "react-icons/md";

const AddRemoteModal = ({ isOpen, onClose, onCreated }) => {
    // Initial States Restored
    const [price, setPrice] = useState('');
    const [hasHardware, setHasHardware] = useState(false);
    const [powered, setPowered] = useState('BYOSE Tech');
    const [manufacture, setManufacture] = useState('BYOSE Tech Labs');
    const [version, setVersion] = useState('2.0.0');
    const [buttons, setButtons] = useState([{ buttonType: 'push' }]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleButtonTypeChange = (index, value) => {
        const newButtons = [...buttons];
        newButtons[index].buttonType = value;
        setButtons(newButtons);
    };

    const addButton = () => setButtons([...buttons, { buttonType: 'push' }]);
    const removeButton = (index) => setButtons(buttons.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
            price: Number(price), // Ensure this is a number
            hasHardware: Boolean(hasHardware), // Ensure this is a boolean
            powered,
            manufacture,
            version,
            buttons
        };
            const { error } = await sendData(`${presence_server}/buttons`, payload, returnToken());

            if (error) {
                alert(error);
            } else {
                if (onCreated) onCreated();
                onClose();
            }
        } catch (err) {
            alert('Unexpected connection error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Ethereal Backdrop */}
            <div className="absolute inset-0 bg-[#0B121A]/70 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
            
            <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up border border-gray-100">
                {/* Modal Header */}
                <div className="p-10 border-b border-gray-50 flex justify-between items-start bg-[#F5F5F5]/40">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-[#333333]">Hardware Provisioning</h2>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#195C51]">Initialize System Components</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <MdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    {/* Row 1: Technical specs */}
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-2">
                        <MdMemory className="text-[#195C51]" size={20}/>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Device Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Retail Price (FRW)</label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="55000"
                                   className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#195C51]/10" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Has State</label>
                            <select value={hasHardware} onChange={(e) => setHasHardware(e.target.value === 'true')}
                                    className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none cursor-pointer">
                                <option value={true}>No</option>
                                <option value={false}>Yes</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Branding */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Manufacturer</label>
                            <input type="text" value={manufacture} onChange={(e) => setManufacture(e.target.value)}
                                   className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">System Version</label>
                            <input type="text" value={version} onChange={(e) => setVersion(e.target.value)}
                                   className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none font-mono" />
                        </div>
                    </div>

                    {/* Row 3: Powered By (Restored Field) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Powered Authority</label>
                        <input type="text" value={powered} onChange={(e) => setPowered(e.target.value)}
                               className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none" />
                    </div>

                    {/* Button Mapping Section */}
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                            <div className="flex items-center gap-3">
                                <MdSettingsSuggest className="text-[#195C51]" size={20}/>
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#333333]">I/O Pin Mapping</h3>
                            </div>
                            <button type="button" onClick={addButton} className="text-[10px] font-black uppercase tracking-widest text-[#195C51] hover:underline">
                                + Add Channel
                            </button>
                        </div>
                        
                        <div className="grid gap-4">
                            {buttons.map((btn, index) => (
                                <div key={index} className="flex items-center gap-4 bg-[#F5F5F5]/40 p-3 rounded-2xl border border-gray-50 animate-slide-right">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-[#195C51] text-xs shadow-sm">
                                        {index + 1}
                                    </div>
                                    <select
                                        value={btn.buttonType}
                                        onChange={(e) => handleButtonTypeChange(index, e.target.value)}
                                        className="flex-grow bg-transparent border-none text-xs font-bold uppercase tracking-widest outline-none cursor-pointer"
                                    >
                                        <option value="push">Momentary Push</option>
                                        <option value="rocker">Toggle Rocker</option>
                                    </select>
                                    {buttons.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeButton(index)}
                                            className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <MdClose size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="p-10 bg-[#F5F5F5]/30 border-t border-gray-50 flex flex-col-reverse sm:flex-row gap-4 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-10 py-4 rounded-2xl font-bold text-gray-400 hover:text-[#333333] hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 bg-[#195C51] text-white px-12 py-4 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        <MdOutlineBolt size={22} />
                        {loading ? "Initializing..." : "Authorize Registry"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRemoteModal;