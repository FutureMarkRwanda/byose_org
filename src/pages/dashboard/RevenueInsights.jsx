// src/pages/dashboard/RevenueInsights.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    CreditCard, Users, Search, ChevronLeft, ChevronRight, 
    Plus, Edit2, Power, PowerOff, ShieldCheck, CheckCircle2, PieChart as PieChartIcon 
} from 'lucide-react';
import { MdVerified, MdAccessTime, MdPauseCircle, MdCancel, MdTimer, MdHourglassEmpty, MdErrorOutline } from 'react-icons/md';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchData, sendData, updateData, patchData, returnToken, formatDate } from '../../utils/helper.js';
import { presence_server } from '../../config/server_api.js';
import { useNotification } from '../../context/NotificationContext.jsx';
import { PrivacyNameToggle } from './DeviceInsights.jsx';

// --- Privacy Helper ---
const maskEmailLocal = (email) => {
    if (!email) return "—";
    const at = email.indexOf("@");
    if (at === -1) return `${email.slice(0, 3)}***`;
    const local = email.slice(0, at);
    const domain = email.slice(at);
    return `${local.slice(0, 3)}${"*".repeat(Math.max(3, local.length - 3))}${domain}`;
};

// --- Shadcn-Simulated UI Components ---
const Card = ({ children, className = "" }) => (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const StatusPill = ({ status }) => {
    const cfg = {
        active: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', icon: MdVerified, label: 'Active' },
        trial: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: MdAccessTime, label: 'Trial' },
        grace_period: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', icon: MdPauseCircle, label: 'Grace Period' },
        cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: MdCancel, label: 'Cancelled' },
        expired: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: MdTimer, label: 'Expired' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: MdHourglassEmpty, label: 'Pending' },
        failed: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: MdErrorOutline, label: 'Failed' },
    }[status?.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: ShieldCheck, label: status };
    
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <Icon size={12} /> {cfg.label}
        </span>
    );
};

export default function RevenueInsights() {
    const token = returnToken();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('subscriptions');

    // --- Subscription & Chart State ---
    const [subs, setSubs] = useState([]);
    const [subStats, setSubStats] = useState({ total: 0, page: 1, totalPages: 1 });
    const [subStatusFilter, setSubStatusFilter] = useState('');
    const [subsLoading, setSubsLoading] = useState(true);
    const [planDistribution, setPlanDistribution] = useState([]); // State for Pie Chart

    // --- Plan State ---
    const [plans, setPlans] = useState([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [saving, setSaving] = useState(false);

    const initialPlanState = {
        name: '', description: '', maxDevices: 1, maxShares: 0, maxSessions: 1,
        minDurationMonths: 1, maxDurationMonths: 12, pricePerMonth: '', features: ''
    };
    const [formData, setFormData] = useState(initialPlanState);

    // --- Data Fetching ---

    // 1. Fetch Paginated Subscriptions (Limit forced to 10)
    const loadSubscriptions = useCallback(async (page = 1, status = subStatusFilter) => {
        setSubsLoading(true);
        try {
            // Force limit=10 for strict pagination
            const query = `?page=${page}&limit=10${status ? `&status=${status}` : ''}`;
            const res = await fetchData(`${presence_server}/api/subscriptions/admin/subscriptions${query}`, token);
            if (res.data) {
                setSubs(res.data.subscriptions || []);
                setSubStats({
                    total: res.data.total,
                    page: res.data.currentPage,
                    totalPages: res.data.totalPages
                });
            }
        } catch (err) {
            showNotification("Failed to load subscriptions", "error");
        }
        setSubsLoading(false);
    }, [token, subStatusFilter]);

    // 2. Fetch Global Stats for accurate Pie Chart (Entire Database)
    const loadGlobalStats = useCallback(async () => {
        try {
            // Fetching a global overview to ensure chart accounts for ALL users, not just page 1
            const res = await fetchData(`${presence_server}/api/admin/analytics-users?limit=1`, token);
            if (res.data?.globalStats?.subscriptionBreakdown) {
                const breakdown = res.data.globalStats.subscriptionBreakdown;
                
                // Aggregate counts by Plan Name (focusing on active/trial/grace_period)
                const planCounts = {};
                breakdown.forEach(item => {
                    if (['active', 'trial', 'grace_period'].includes(item.status)) {
                        const name = item.planName || 'Unknown Plan';
                        planCounts[name] = (planCounts[name] || 0) + item.count;
                    }
                });

                // Format for Recharts
                const CHART_COLORS = ['#195C51', '#2DC87A', '#F0A500', '#6B8BD4', '#8B5CF6'];
                const formattedData = Object.entries(planCounts).map(([name, value], index) => ({
                    name,
                    value,
                    color: CHART_COLORS[index % CHART_COLORS.length]
                }));

                setPlanDistribution(formattedData);
            }
        } catch (err) {
            console.error("Failed to load plan stats for chart", err);
        }
    }, [token]);

    // 3. Fetch Plans
    const loadPlans = useCallback(async () => {
        setPlansLoading(true);
        try {
            const res = await fetchData(`${presence_server}/api/subscriptions/admin/plans`, token);
            if (res.data) setPlans(res.data.plans || []);
        } catch (err) {
            showNotification("Failed to load plans", "error");
        }
        setPlansLoading(false);
    }, [token]);

    // Effect Trigger
    useEffect(() => {
        if (activeTab === 'subscriptions') {
            loadSubscriptions(1);
            loadGlobalStats(); // Load chart data alongside table data
        }
        if (activeTab === 'plans') loadPlans();
    }, [activeTab, loadSubscriptions, loadGlobalStats, loadPlans]);

    // --- Plan Management Handlers ---
    const handleOpenModal = (plan = null) => {
        if (plan) {
            const rwfPrice = plan.pricing?.find(p => p.currency === 'RWF') || plan.pricing?.[0];
            setFormData({
                ...plan,
                pricePerMonth: rwfPrice ? rwfPrice.pricePerMonth : '',
                features: plan.features ? plan.features.join(', ') : ''
            });
            setEditingPlan(plan);
        } else {
            setFormData(initialPlanState);
            setEditingPlan(null);
        }
        setIsModalOpen(true);
    };

    const handleSavePlan = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...formData,
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
                pricing: [{ country: 'RW', currency: 'RWF', pricePerMonth: Number(formData.pricePerMonth) }]
            };

            let res;
            if (editingPlan) {
                res = await updateData(`${presence_server}/api/subscriptions/admin/plans/${editingPlan._id}`, payload, token);
            } else {
                res = await sendData(`${presence_server}/api/subscriptions/admin/plans`, payload, token);
            }

            if (res.error) throw new Error(res.error);
            
            showNotification(`Plan ${editingPlan ? 'updated' : 'created'} successfully`, "success");
            setIsModalOpen(false);
            loadPlans();
        } catch (err) {
            showNotification(err.message, "error");
        }
        setSaving(false);
    };

    const handleTogglePlanStatus = async (planId, isActive) => {
        try {
            const endpoint = isActive ? `/api/subscriptions/admin/plan/disable/${planId}` : `/api/subscriptions/admin/enable/${planId}`;
            const res = await patchData(`${presence_server}${endpoint}`, {}, token);
            if (res.error) throw new Error(res.error);
            showNotification(`Plan ${isActive ? 'disabled' : 'enabled'}`, "success");
            loadPlans();
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    return (
        <div className="space-y-6 font-sans text-slate-900 pb-10">
            {/* Header */}
            <div>
                <h1 className="font-display text-3xl font-bold tracking-tight">Revenue Insights</h1>
                <p className="text-slate-500 text-sm mt-1">Manage subscription tiers and monitor customer billing statuses.</p>
            </div>

            {/* Tab Controls */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
                <button onClick={() => setActiveTab('subscriptions')} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'subscriptions' ? 'bg-[#195C51] text-white shadow-md' : 'text-gray-500 hover:text-[#195C51]'}`}>
                    <Users size={16} /> Subscribers
                </button>
                <button onClick={() => setActiveTab('plans')} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'plans' ? 'bg-[#195C51] text-white shadow-md' : 'text-gray-500 hover:text-[#195C51]'}`}>
                    <CreditCard size={16} /> Plan Management
                </button>
            </div>

            {/* --- TAB 1: SUBSCRIBER DIRECTORY --- */}
            {activeTab === 'subscriptions' && (
                <div className="animate-slide-entrance space-y-6">
                    
                    {/* PIE CHART SECTION */}
                    {planDistribution.length > 0 && (
                        <Card className="p-6 flex flex-col md:flex-row items-center gap-8">
                            <div className="md:w-1/3 space-y-3">
                                <div className="flex items-center gap-2">
                                    <PieChartIcon className="w-6 h-6 text-[#195C51]" />
                                    <h2 className="font-display font-bold text-xl">Active Plan Distribution</h2>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    A global breakdown of your user base currently on an active, trial, or grace period plan across the entire ecosystem.
                                </p>
                            </div>
                            <div className="h-[220px] w-full md:w-2/3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-center p-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={planDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {planDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#334155' }}
                                            formatter={(value) => [`${value} Subscribers`, 'Users']}
                                        />
                                        <Legend 
                                            verticalAlign="middle" 
                                            align="right" 
                                            layout="vertical" 
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '12px', fontWeight: '700', color: '#475569' }} 
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    )}

                    {/* TABLE SECTION */}
                    <Card className="overflow-hidden">
                        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                            <div>
                                <h2 className="font-display font-semibold text-lg">Subscriber Directory</h2>
                                <p className="text-xs text-slate-500 mt-1">Total Records: {subStats.total} (Showing 10 per page)</p>
                            </div>
                            
                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                                {['', 'active', 'grace_period', 'expired', 'cancelled'].map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => { setSubStatusFilter(status); loadSubscriptions(1, status); }}
                                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${subStatusFilter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                    >
                                        {status === '' ? 'All' : status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Plan & Duration</th>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Revenue</th>
                                        <th className="px-6 py-4 font-semibold text-[10px] uppercase tracking-wider">Timeline</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {subsLoading ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center"><div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                                    ) : subs.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">No subscription records found.</td></tr>
                                    ) : subs.map(sub => {
                                        const user = sub.user || {};
                                        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                                        return (
                                            <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <PrivacyNameToggle fullName={fullName || 'Unknown User'} />
                                                    {/* Masked Email Rendered Here */}
                                                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{maskEmailLocal(user.email)}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800">{sub.plan?.name || 'Unknown Plan'}</p>
                                                    <p className="text-xs text-slate-500">{sub.durationMonths} Month{sub.durationMonths > 1 ? 's' : ''}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusPill status={sub.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-[#195C51]">{sub.pricingSnapshot?.totalPaid?.toLocaleString() || 0} {sub.pricingSnapshot?.currency}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{sub.paymentMethod}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-medium text-slate-700">Starts: {formatDate(sub.startDate)}</p>
                                                    <p className="text-xs font-medium text-slate-500">Ends: {formatDate(sub.endDate)}</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {subStats.totalPages > 1 && (
                            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">Page {subStats.page} of {subStats.totalPages}</span>
                                <div className="flex items-center gap-2">
                                    <button disabled={subStats.page === 1} onClick={() => loadSubscriptions(subStats.page - 1)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-bold transition-all flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Prev</button>
                                    <button disabled={subStats.page >= subStats.totalPages} onClick={() => loadSubscriptions(subStats.page + 1)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 text-xs font-bold transition-all flex items-center gap-1">Next <ChevronRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* --- TAB 2: PLAN MANAGEMENT --- */}
            {activeTab === 'plans' && (
                <div className="animate-slide-entrance space-y-6">
                    <div className="flex justify-end">
                        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-[#195C51] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#0E3A32] shadow-md transition-all active:scale-95">
                            <Plus size={16} /> Create New Tier
                        </button>
                    </div>

                    {plansLoading ? (
                        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#195C51] border-t-transparent rounded-full animate-spin"></div></div>
                    ) : plans.length === 0 ? (
                        <Card className="p-12 flex flex-col items-center text-center">
                            <CreditCard className="w-12 h-12 text-slate-200 mb-4" />
                            <h3 className="font-bold text-lg text-slate-700">No Plans Configured</h3>
                            <p className="text-sm text-slate-500 mt-1 mb-6">Create your first subscription tier to start monetizing.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {plans.map(plan => {
                                const localPrice = plan.pricing?.find(p => p.currency === 'RWF') || plan.pricing?.[0];
                                return (
                                    <Card key={plan._id} className={`flex flex-col h-full transition-all ${plan.isActive ? 'border-[#195C51]/20 hover:shadow-lg' : 'opacity-70 grayscale-[30%]'}`}>
                                        <div className={`h-2 w-full ${plan.isActive ? 'bg-[#195C51]' : 'bg-slate-300'}`} />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-display font-bold text-xl text-slate-900">{plan.name}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">{plan.description || 'No description'}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${plan.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {plan.isActive ? 'Active' : 'Disabled'}
                                                </span>
                                            </div>

                                            <div className="mb-6 flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-slate-900">{localPrice?.pricePerMonth?.toLocaleString() || 0}</span>
                                                <span className="text-sm font-bold text-slate-500">{localPrice?.currency || 'RWF'}/mo</span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-6">
                                                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                                                    <p className="text-sm font-black text-[#195C51]">{plan.maxDevices}</p>
                                                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Devices</p>
                                                </div>
                                                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                                                    <p className="text-sm font-black text-[#195C51]">{plan.maxShares}</p>
                                                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Shares</p>
                                                </div>
                                                <div className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                                                    <p className="text-sm font-black text-[#195C51]">{plan.maxSessions}</p>
                                                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Logins</p>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Features Included</h4>
                                                <ul className="space-y-2">
                                                    {plan.features?.map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                                                            <CheckCircle2 className="w-4 h-4 text-[#195C51] shrink-0" /> {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="mt-8 pt-4 border-t border-slate-100 flex gap-2">
                                                <button onClick={() => handleOpenModal(plan)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200">
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button onClick={() => handleTogglePlanStatus(plan._id, plan.isActive)} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors border ${plan.isActive ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}>
                                                    {plan.isActive ? <><PowerOff size={14}/> Disable</> : <><Power size={14}/> Enable</>}
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* --- PLAN MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                        
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{editingPlan ? 'Edit Subscription Tier' : 'Create Subscription Tier'}</h2>
                                <p className="text-xs text-slate-500 font-medium">Define limits and pricing for this plan.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                                <MdCancel size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="plan-form" onSubmit={handleSavePlan} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Plan Name *</label>
                                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all" />
                                    </div>
                                    
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Description</label>
                                        <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51]" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Price Per Month (RWF) *</label>
                                        <input type="number" required min="0" value={formData.pricePerMonth} onChange={e => setFormData({...formData, pricePerMonth: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#195C51]" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Max Devices *</label>
                                        <input type="number" required min="1" value={formData.maxDevices} onChange={e => setFormData({...formData, maxDevices: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51]" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Max Shares *</label>
                                        <input type="number" required min="0" value={formData.maxShares} onChange={e => setFormData({...formData, maxShares: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51]" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Max Login Sessions *</label>
                                        <input type="number" required min="1" value={formData.maxSessions} onChange={e => setFormData({...formData, maxSessions: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51]" />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex justify-between">
                                            <span>Features</span>
                                            <span className="text-gray-400 font-normal normal-case">(Comma separated)</span>
                                        </label>
                                        <textarea rows="3" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} placeholder="Analytics dashboard, Priority support..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#195C51] resize-none custom-scrollbar" />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors text-sm">
                                Cancel
                            </button>
                            <button type="submit" form="plan-form" disabled={saving} className="px-8 py-2.5 bg-[#195C51] text-white rounded-xl font-bold hover:bg-[#0E3A32] transition-colors shadow-md disabled:opacity-50 text-sm">
                                {saving ? "Saving..." : "Save Tier Configuration"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}