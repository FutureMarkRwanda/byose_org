import React, { useState, useEffect } from 'react';
import { 
    MdAdd, MdEdit, MdSettings, MdLayers, MdDeleteOutline, 
    MdListAlt, MdCheckCircle, MdBlock, MdClose 
} from 'react-icons/md';
import { fetchData, sendData, updateData, patchData, returnToken } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";
import { useNotification } from "../../context/NotificationContext.jsx";

const PresenceEyePlans = () => {
    const { showNotification } = useNotification();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    const initialForm = {
        name: "", 
        description: "", 
        maxDevices: 5, 
        maxShares: 10,
        maxSessions: 1, 
        minDurationMonths: 1, 
        maxDurationMonths: 12,
        pricing: [{ country: "RW", currency: "RWF", pricePerMonth: 0 }],
        features: []
    };

    const [form, setForm] = useState(initialForm);

    useEffect(() => { loadPlans(); }, []);

    const loadPlans = async () => {
        setLoading(true);
        // All plans (active & disabled)
        const { data, error } = await fetchData(`${presence_server}/api/subscriptions/admin/plans`, returnToken());
        if (!error) {
            setPlans(data.plans || []);
        } else {
            showNotification(error, "error");
        }
        setLoading(false);
    };

    // --- Soft Delete Logic (Enable/Disable) ---
const handleToggleStatus = async (planId, currentlyActive) => {
    const action = currentlyActive ? "disable" : "enable";
    
    // Construct the URL without any potential whitespace or newlines
    const url = currentlyActive 
        ? `${presence_server}/api/subscriptions/admin/plans/disable/${planId}`
        : `${presence_server}/api/subscriptions/admin/plans/enable/${planId}`;

    setLoading(true);
    const result = await patchData(url, {}, returnToken());

    if (!result.error) {
        showNotification(`Plan ${action}d successfully`, "success");
        loadPlans();
    } else {
        showNotification(result.error, "error");
    }
    setLoading(false);
};

    // --- Dynamic Features Management ---
    const handleAddFeature = () => setForm({ ...form, features: [...form.features, ""] });
    const handleRemoveFeature = (index) => setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
    const handleFeatureChange = (index, value) => {
        const newFeatures = [...form.features];
        newFeatures[index] = value;
        setForm({ ...form, features: newFeatures });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Filter out empty features and convert price to number to avoid 400 Bad Request
        const payload = {
            ...form,
            pricing: form.pricing.map(p => ({ ...p, pricePerMonth: Number(p.pricePerMonth) })),
            features: form.features.filter(f => f.trim() !== "") 
        };

        const url = editingPlan 
            ? `${presence_server}/api/subscriptions/admin/plans/${editingPlan._id}`
            : `${presence_server}/api/subscriptions/admin/plans`;
        
        const method = editingPlan ? updateData : sendData;
        const result = await method(url, payload, returnToken());

        if (!result.error) {
            showNotification(editingPlan ? "Plan updated" : "Plan created", "success");
            setShowForm(false);
            setEditingPlan(null);
            loadPlans();
        } else {
            showNotification(result.error, "error");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-slide-entrance">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-bold text-[#333333]">Subscription Architecture</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage access tiers, pricing, and lifecycle states.</p>
                </div>
                <button onClick={() => { setForm(initialForm); setEditingPlan(null); setShowForm(true); }} 
                        className="bg-[#195C51] text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl hover:bg-[#0E3A32] transition-all active:scale-95">
                    <MdAdd size={20}/> New Plan
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
                {plans.map(plan => (
                    <div 
                        key={plan._id} 
                        className={`google-card p-8 bg-white flex flex-col justify-between border-t-4 transition-all duration-500 ${
                            plan.isActive 
                                ? 'border-[#195C51]' 
                                : 'border-gray-300 opacity-60 grayscale-[0.4]'
                        }`}
                    >
                        <div className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-[#333333] tracking-tight">{plan.name}</h3>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                        plan.isActive ? 'text-green-600 border-green-100 bg-green-50' : 'text-gray-400 border-gray-100 bg-gray-50'
                                    }`}>
                                        {plan.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setEditingPlan(plan); setForm(plan); setShowForm(true); }} 
                                        className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-[#195C51] transition-colors"
                                    >
                                        <MdEdit size={18}/>
                                    </button>
                                    <button 
                                        onClick={() => handleToggleStatus(plan._id, plan.isActive)}
                                        className={`p-2 rounded-lg transition-all ${
                                            plan.isActive 
                                                ? 'bg-red-50 text-red-300 hover:text-red-600' 
                                                : 'bg-green-50 text-green-300 hover:text-green-600'
                                        }`}
                                        title={plan.isActive ? "Disable Plan" : "Enable Plan"}
                                    >
                                        {plan.isActive ? <MdBlock size={18}/> : <MdCheckCircle size={18}/>}
                                    </button>
                                </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-2 h-8">{plan.description}</p>
                            
                            <div className="py-4 border-y border-gray-50">
                                <div className="text-3xl font-black text-[#195C51] tracking-tighter">
                                    {plan.pricing[0]?.pricePerMonth.toLocaleString()} <span className="text-[10px] uppercase text-gray-400 font-black tracking-widest ml-1">{plan.pricing[0]?.currency} / MO</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Node Configuration</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-700"><MdSettings className="text-[#195C51]"/> Devices Cap: {plan.maxDevices}</div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-700"><MdLayers className="text-[#195C51]"/> Min Contract: {plan.minDurationMonths} Mo.</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && plans.length === 0 && (
                <div className="p-20 text-center text-gray-400 font-bold animate-pulse">Synchronizing Plan Registries...</div>
            )}

            {/* FORM MODAL */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-[#0B121A]/80 backdrop-blur-md" onClick={() => setShowForm(false)}></div>
                    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl p-10 overflow-y-auto max-h-[90vh] custom-scrollbar border border-gray-100">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-[#333333]">{editingPlan ? 'Refine Plan' : 'Establish New Tier'}</h2>
                                <p className="text-xs font-black uppercase tracking-widest text-[#195C51] mt-1">Configure System Entitlements</p>
                            </div>
                            <button type="button" onClick={() => setShowForm(false)} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black">
                                <MdClose size={24}/>
                            </button>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Plan Identity</label>
                                <input placeholder="e.g. Pro Plus" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#F5F5F5] border-none rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#195C51]/10" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Service Description</label>
                                <textarea placeholder="Describe the value proposition..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-[#F5F5F5] border-none rounded-3xl p-5 text-sm outline-none h-24 resize-none" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Max Devices</label>
                                    <input type="number" value={form.maxDevices} onChange={e => setForm({...form, maxDevices: e.target.value})} className="w-full bg-[#F5F5F5] rounded-2xl p-4 text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Min Mo.</label>
                                    <input type="number" value={form.minDurationMonths} onChange={e => setForm({...form, minDurationMonths: e.target.value})} className="w-full bg-[#F5F5F5] rounded-2xl p-4 text-sm font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Price (RWF)</label>
                                    <input type="number" value={form.pricing[0].pricePerMonth} onChange={e => {
                                        let p = [...form.pricing];
                                        p[0].pricePerMonth = e.target.value;
                                        setForm({...form, pricing: p});
                                    }} className="w-full bg-[#F5F5F5] rounded-2xl p-4 text-sm font-bold" required />
                                </div>
                            </div>

                            {/* FEATURES LIST */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><MdListAlt size={16}/> Service Features</label>
                                    <button type="button" onClick={handleAddFeature} className="text-[10px] font-black uppercase text-[#195C51] hover:underline">+ Add Feature</button>
                                </div>
                                <div className="space-y-3">
                                    {form.features.map((feat, idx) => (
                                        <div key={idx} className="flex gap-3 animate-slide-right">
                                            <input 
                                                placeholder="e.g. Priority Support" 
                                                value={feat} 
                                                onChange={e => handleFeatureChange(idx, e.target.value)}
                                                className="flex-grow bg-[#F5F5F5] rounded-xl p-3 text-xs font-bold outline-none"
                                            />
                                            <button type="button" onClick={() => handleRemoveFeature(idx)} className="p-3 text-red-200 hover:text-red-500 transition-colors"><MdDeleteOutline size={20}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-[#195C51] text-white py-5 rounded-[2rem] font-bold shadow-2xl hover:bg-[#0E3A32] transition-all active:scale-95 disabled:opacity-50">
                                {loading ? "Authorizing..." : editingPlan ? "Commit Tier Refinement" : "Authorize New Tier"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PresenceEyePlans;