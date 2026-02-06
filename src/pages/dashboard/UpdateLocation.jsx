import React, { useState } from 'react';
import { MdMyLocation, MdMap, MdPinDrop, MdMemory, MdPublish } from 'react-icons/md';
import { patchData, returnToken } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";
import { useNotification } from "../../context/NotificationContext.jsx";

const UpdateLocation = () => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        serialNumber: '',
        latitude: '',
        longitude: '',
        accuracy: '',
        address: '',
        source: 'manual'
    });

    const fetchGPS = () => {
        if (!navigator.geolocation) return showNotification("Geolocation not supported", "error");
        
        navigator.geolocation.getCurrentPosition((pos) => {
            setForm(prev => ({
                ...prev,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: Math.round(pos.coords.accuracy),
                source: 'gps'
            }));
            showNotification("Coordinates captured", "success");
        }, (err) => showNotification(err.message, "error"), { enableHighAccuracy: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { serialNumber, ...payload } = form;
        
        const result = await patchData(
            `${presence_server}/remotes/${serialNumber}/location`, 
            payload, 
            returnToken()
        );

        if (result.error) {
            showNotification(result.error, "error");
        } else {
            showNotification("Device location synced to cloud", "success");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-slide-entrance max-w-4xl">
            <header className="px-2">
                <h1 className="text-3xl font-bold text-[#333333]">Geo-Provisioning</h1>
                <p className="text-sm text-gray-500 font-medium">Update the physical deployment coordinates of a remote node.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 px-2">
                <div className="google-card p-10 bg-white space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <MdMemory size={14} className="text-[#195C51]"/> Device Serial Number
                        </label>
                        <input 
                            value={form.serialNumber}
                            onChange={e => setForm({...form, serialNumber: e.target.value})}
                            required placeholder="e.g. BYOSE-PRO-001"
                            className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#195C51]/10" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Latitude</label>
                            <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} required className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Longitude</label>
                            <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} required className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none" />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            type="button" onClick={fetchGPS}
                            className="flex items-center justify-center gap-3 bg-[#F5F5F5] text-[#195C51] px-6 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all text-sm"
                        >
                            <MdMyLocation size={20}/> Capture Current GPS
                        </button>
                        <div className="flex-grow space-y-2">
                            <input 
                                placeholder="Human readable address (Optional)"
                                value={form.address}
                                onChange={e => setForm({...form, address: e.target.value})}
                                className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm outline-none" 
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-4 bg-[#195C51] text-white py-5 rounded-[2.5rem] font-bold hover:bg-[#0E3A32] shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                    <MdPublish size={24}/> {loading ? "Syncing..." : "Update Network Location"}
                </button>
            </form>
        </div>
    );
};

export default UpdateLocation;