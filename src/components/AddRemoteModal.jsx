import React, { useState } from 'react';
import { returnToken, sendData } from "../utils/helper.js";
import { presence_server } from "../config/server_api.js";
import { MdClose, MdOutlineBolt, MdSettingsInputComponent } from "react-icons/md";

const AddRemoteModal = ({ isOpen, onClose, onCreated }) => {
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
            const payload = { price: Number(price), hasHardware, powered, manufacture, version, buttons };
            const { data, error } = await sendData(`${presence_server}/buttons`, payload, returnToken());

            if (error) {
                alert(error);
            } else {
                if (onCreated) onCreated(data);
                onClose();
            }
        } catch (err) {
            alert('Provisioning failed. Check network.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark Ethereal Overlay */}
            <div className="absolute inset-0 bg-[#0B121A]/80 backdrop-blur-md" onClick={onClose}></div>
            
            <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up border border-white/20">
                {/* Header */}
                <div className="p-10 border-b border-gray-50 flex justify-between items-start">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold text-[#333333]">Provision Device</h2>
                        <p className="text-gray-400 font-medium">Link new physical hardware to the digital grid.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <MdClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* General Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#195C51] ml-1">MSRP Price (FRW)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="55000"
                                className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#195C51]/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#195C51] ml-1">Hardware Status</label>
                            <div className="relative">
                                <select
                                    value={hasHardware}
                                    onChange={(e) => setHasHardware(e.target.value === 'true')}
                                    className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#195C51]/20 outline-none appearance-none cursor-pointer"
                                >
                                    <option value={true}>Ready for Shipping</option>
                                    <option value={false}>Software Simulated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#195C51] ml-1">Firmware Version</label>
                            <input
                                type="text"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#195C51]/20 outline-none font-mono"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#195C51] ml-1">Branding / Powered</label>
                            <input
                                type="text"
                                value={powered}
                                onChange={(e) => setPowered(e.target.value)}
                                className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#195C51]/20 outline-none"
                            />
                        </div>
                    </div>

                    {/* Button Config */}
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <h3 className="flex items-center gap-2 font-bold text-[#333333]">
                                <MdSettingsInputComponent className="text-[#195C51]" /> 
                                I/O Pin Mappings
                            </h3>
                            <button
                                type="button"
                                onClick={addButton}
                                className="text-xs font-black uppercase tracking-widest text-[#195C51] hover:text-[#0E3A32]"
                            >
                                + Add Channel
                            </button>
                        </div>
                        
                        <div className="grid gap-4">
                            {buttons.map((btn, index) => (
                                <div key={index} className="flex items-center gap-4 bg-[#F5F5F5]/50 p-2 rounded-2xl border border-gray-50">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-[#195C51] text-xs shadow-sm">
                                        {index + 1}
                                    </div>
                                    <select
                                        value={btn.buttonType}
                                        onChange={(e) => handleButtonTypeChange(index, e.target.value)}
                                        className="flex-grow bg-transparent border-none text-sm outline-none cursor-pointer font-medium"
                                    >
                                        <option value="push">Momentary Push</option>
                                        <option value="rocker">Persistent Rocker</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => removeButton(index)}
                                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <MdClose size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
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
                        className="flex items-center justify-center gap-2 bg-[#195C51] text-white px-12 py-4 rounded-2xl font-bold hover:bg-[#0E3A32] shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                        <MdOutlineBolt size={20} />
                        {loading ? "Provisioning..." : "Finalize Infrastructure"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRemoteModal;