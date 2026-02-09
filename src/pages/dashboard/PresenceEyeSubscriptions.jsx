import React, { useState, useEffect } from 'react';
import { MdFilterList, MdSearch, MdDateRange, MdPersonOutline, MdOutlineHistoryEdu } from 'react-icons/md';
import { fetchData, returnToken, formatDate } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";

const PresenceEyeSubscriptions = () => {
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('active');

    useEffect(() => { loadSubscriptions(); }, [status]);

    const loadSubscriptions = async () => {
        setLoading(true);
        const { data, error } = await fetchData(`${presence_server}/api/subscriptions/admin/subscriptions?status=${status}`, returnToken());
        if (!error) setSubs(data.subscriptions);
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-slide-entrance pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-bold text-[#333333]">Subscription Ledger</h1>
                    <p className="text-sm text-gray-500 font-medium">Tracking active licenses across the global network.</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    {['active', 'expired', 'canceled'].map(s => (
                        <button key={s} onClick={() => setStatus(s)} 
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${status === s ? 'bg-[#195C51] text-white shadow-md' : 'text-gray-400'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="google-card overflow-hidden bg-white mx-2">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F5F5F5]/60 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Subscriber</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Current Tier</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Lifecycle</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Revenue</th>
                                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {subs.map((sub) => (
                                <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400"><MdPersonOutline/></div>
                                            <div>
                                                <div className="font-bold text-[#333333] text-sm">{sub.userId?.firstName} {sub.userId?.lastName}</div>
                                                <div className="text-[10px] text-gray-400 font-medium">{sub.userId?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <MdOutlineHistoryEdu className="text-[#195C51]"/>
                                            <span className="text-xs font-bold text-gray-700">{sub.planId?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-xs font-medium text-gray-500">Expires: {formatDate(sub.endDate)}</div>
                                        <div className="text-[9px] text-gray-300 uppercase font-black">Started {formatDate(sub.startDate)}</div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-[#195C51] text-sm">
                                        {sub.price?.toLocaleString()} <span className="text-[9px] text-gray-400">{sub.currency}</span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${sub.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {subs.length === 0 && !loading && (
                    <div className="p-20 text-center text-gray-300 text-[10px] font-black uppercase tracking-[0.3em]">No subscription logs found.</div>
                )}
            </div>
        </div>
    );
};

export default PresenceEyeSubscriptions;