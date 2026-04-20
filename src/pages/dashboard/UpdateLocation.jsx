import { useState } from 'react';
import { MdMyLocation, MdPublish } from 'react-icons/md';
import { Cpu, MapPin } from "lucide-react";
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
            `${presence_server}/api/remotes/${serialNumber}/location`,
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
        <div className="space-y-6 animate-slide-entrance max-w-3xl">
            <header>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Geo-Provisioning</h1>
                <p className="text-sm text-slate-500 mt-1">Update the physical deployment coordinates of a remote node.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8 space-y-6">

                    {/* Section 1: Identity */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-[#195C51]"/> Device Serial Number
                        </label>
                        <input 
                            value={form.serialNumber}
                            onChange={e => setForm({...form, serialNumber: e.target.value})}
                            required placeholder="e.g. BYOSE-PRO-001"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#195C51]/20 focus:border-[#195C51] transition-all" 
                        />
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2: Coordinates */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#195C51]"/> Geographic Coordinates
                            </label>
                            <button 
                                type="button" onClick={fetchGPS}
                                className="flex items-center gap-2 text-xs font-semibold text-[#195C51] bg-[#195C51]/10 px-3 py-1.5 rounded-md hover:bg-[#195C51]/20 transition-colors"
                            >
                                <MdMyLocation size={16}/> Auto Capture
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500">Latitude</label>
                                <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#195C51]/20 focus:border-[#195C51] transition-all" placeholder="-1.9441" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-500">Longitude</label>
                                <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#195C51]/20 focus:border-[#195C51] transition-all" placeholder="30.0619" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Address */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Physical Address (Optional)</label>
                        <input 
                            placeholder="Human readable address"
                            value={form.address}
                            onChange={e => setForm({...form, address: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#195C51]/20 focus:border-[#195C51] transition-all" 
                        />
                    </div>

                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button 
                        type="submit" disabled={loading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#195C51] text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-[#0E3A32] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <MdPublish size={18}/>
                        )}
                        {loading ? "Syncing..." : "Update Location"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateLocation;