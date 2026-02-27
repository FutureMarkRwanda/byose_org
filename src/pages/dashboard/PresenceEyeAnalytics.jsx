// src/pages/dashboard/PresenceEyeAnalytics.jsx
// ─── Presence Eye — Analytics Dashboard (v5) ─────────────────────────────────
// Changes: frequency endpoint fixed, online trend from DeviceDailySession,
//          Map tab with device pins, Plans management, Daily Report generator,
//          Network Intelligence removed

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { fetchData, returnToken } from '../../utils/helper.js';
import { presence_server } from '../../config/server_api.js';
import {
  MdTrendingUp, MdPeople, MdDevices, MdAttachMoney,
  MdWarning, MdRefresh, MdCreditCard, MdTimer,
  MdCheckCircle, MdErrorOutline, MdHourglassEmpty,
  MdSignalWifi4Bar, MdBubbleChart, MdInfoOutline, MdClose,
  MdWifi, MdTrendingDown, MdLocationOn, MdAdd, MdEdit,
  MdDelete, MdToggleOn, MdToggleOff, MdDownload, MdCalendarToday,
  MdCheckBox, MdMap, MdPictureAsPdf,
} from 'react-icons/md';

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary:      '#195C51',
  primaryLight: '#1E7060',
  accent:       '#2DC87A',
  accentWarm:   '#F0A500',
  danger:       '#E84040',
  muted:        '#8FA99E',
};
const COLORS = [C.primary, C.accent, C.accentWarm, '#6B8BD4', '#E84040', '#A78BFA'];
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const fmt = (val, cur = 'RWF') => {
  if (val == null) return '—';
  if (val >= 1_000_000) return `${(val/1_000_000).toFixed(1)}M ${cur}`;
  if (val >= 1_000)     return `${(val/1_000).toFixed(0)}K ${cur}`;
  return `${val} ${cur}`;
};
const monthLabel = (y, m) => `${MONTHS[((m||1)-1)]} ${String(y||'').slice(2)}`;
const safe = (v) => (Array.isArray(v) ? v : []);

// ─── UI primitives ────────────────────────────────────────────────────────────
const Sk = ({ cls='' }) => <div className={`animate-pulse bg-gray-100 rounded-xl ${cls}`}/>;

const Info = ({ text }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const cb = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', cb);
    return () => document.removeEventListener('mousedown', cb);
  }, [open]);
  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button onClick={() => setOpen(v=>!v)}
        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-[#195C51] hover:bg-[#195C51]/10 transition-all">
        <MdInfoOutline size={15}/>
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-80 bg-[#1A2E2A] text-white text-[11px] rounded-2xl px-4 py-4 shadow-2xl leading-relaxed border border-white/10">
          <button onClick={()=>setOpen(false)} className="absolute top-2.5 right-3 text-gray-400 hover:text-white"><MdClose size={12}/></button>
          {text}
        </div>
      )}
    </div>
  );
};

const Card = ({ title, subtitle, info, children, cls='', action }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm ${cls}`}>
    <div className="flex items-start justify-between mb-4 gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#1A2E2A]">{title}</h3>
        {subtitle && <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">{action}{info && <Info text={info}/>}</div>
    </div>
    {children}
  </div>
);

const KPI = ({ label, value, sub, color=C.primary, info, loading, highlight }) => (
  <div className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-sm ${highlight?'border-[#2DC87A]/40 ring-1 ring-[#2DC87A]/20':'border-gray-100'}`}>
    <div className="flex items-start justify-between mb-2">
      {loading ? <Sk cls="h-6 w-14"/> : (
        <p className="text-xl sm:text-2xl font-black leading-none" style={color!==C.primary?{color}:{color:'#1A2E2A'}}>{value??'—'}</p>
      )}
      {info && <Info text={info}/>}
    </div>
    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1 leading-tight">{label}</p>
    {sub && <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-tight">{sub}</p>}
  </div>
);

const Stat = ({ icon:Icon, label, value, sub, color=C.primary, info, loading }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${color}18`}}>
        <Icon size={18} style={{color}}/>
      </div>
      {info && <Info text={info}/>}
    </div>
    {loading ? (
      <><Sk cls="h-6 w-16 mb-1.5"/><Sk cls="h-3 w-24 mb-1"/><Sk cls="h-3 w-16"/></>
    ) : (
      <>
        <p className="text-xl sm:text-2xl font-black text-[#1A2E2A]">{value??'—'}</p>
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1 leading-tight">{label}</p>
        {sub && <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-tight">{sub}</p>}
      </>
    )}
  </div>
);

const Section = ({ icon:Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 sm:gap-4 py-1">
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${C.primary}15`}}>
      <Icon size={18} style={{color:C.primary}}/>
    </div>
    <div>
      <h2 className="text-base sm:text-lg font-black text-[#1A2E2A]">{title}</h2>
      {subtitle && <p className="text-[11px] sm:text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

const CTip = ({ active, payload, label, cur }) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="bg-[#1A2E2A] text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-white/10 max-w-[220px]">
      <p className="font-bold mb-1.5 text-gray-300 text-[10px]">{label}</p>
      {payload.map((p,i) => (
        <p key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:p.color}}/>
          <span className="text-gray-300 text-[10px]">{p.name}:</span>
          <span className="font-black text-[10px] flex-shrink-0" style={{color:p.color}}>
            {cur ? fmt(p.value,cur) : (p.value??0).toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  );
};

const DurationPicker = ({ value, onChange, options }) => (
  <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
    {options.map(o => (
      <button key={o.value} onClick={()=>onChange(o.value)}
        className={`px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all
          ${value===o.value?'bg-[#195C51] text-white shadow-sm':'text-gray-500 hover:text-[#195C51]'}`}>
        {o.label}
      </button>
    ))}
  </div>
);

const Tab = ({ label, active, onClick, badge }) => (
  <button onClick={onClick}
    className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
      ${active?'bg-[#195C51] text-white shadow-md':'text-gray-400 hover:text-[#195C51] hover:bg-[#195C51]/5'}`}>
    {label}
    {badge>0 && (
      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{badge}</span>
    )}
  </button>
);

const Bar2 = ({ label, sublabel, value, color=C.primary, note }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1.5 gap-2">
      <span className="text-xs font-bold text-gray-600 truncate">{label}</span>
      <span className="text-xs font-black text-[#1A2E2A] flex-shrink-0">{sublabel}</span>
    </div>
    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.min(value,100)}%`,background:color}}/>
    </div>
    {note && <p className="text-[10px] text-gray-400 mt-1">{note}</p>}
  </div>
);

const AlertCard = ({ count, label, icon:Icon, desc, sev='warn' }) => {
  const p = {
    warn:  {text:'#B45309',icon:'#D97706'},
    danger:{text:'#DC2626',icon:'#EF4444'},
    ok:    {text:'#16A34A',icon:'#22C55E'},
  }[sev];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${p.icon}18`}}>
          <Icon size={16} style={{color:p.icon}}/>
        </div>
        <p className="text-xl sm:text-2xl font-black" style={{color:p.text}}>{count??'—'}</p>
      </div>
      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1 leading-tight">{label}</p>
      {desc && <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">{desc}</p>}
    </div>
  );
};

const Empty = ({ msg='No data yet' }) => (
  <div className="flex flex-col items-center justify-center py-8 gap-2 opacity-50">
    <MdBubbleChart size={24} className="text-gray-300"/>
    <p className="text-[11px] text-gray-400 text-center px-4">{msg}</p>
  </div>
);

const HC = ({ v, max }) => {
  const alpha = max>0 && v>0 ? 0.08+(v/max)*0.88 : 0;
  return (
    <div className="w-full aspect-square rounded-sm cursor-default"
      style={{background: alpha===0?'#F3F4F6':`rgba(25,92,81,${alpha})`}}
      title={`${v} opens`}/>
  );
};

const DeltaBadge = ({ val }) => {
  if (val==null||isNaN(val)) return null;
  const up = val >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full
      ${up?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>
      {up ? <MdTrendingUp size={9}/> : <MdTrendingDown size={9}/>}
      {Math.abs(val)}%
    </span>
  );
};

// ─── Modal shell ──────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, wide=false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide?'max-w-2xl':'max-w-lg'} my-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-black text-[#1A2E2A] uppercase tracking-wider">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#1A2E2A] hover:bg-gray-100 transition-all">
            <MdClose size={16}/>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

const Input = ({ label, type='text', value, onChange, placeholder, required, step, min }) => (
  <div>
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">{label}{required&&<span className="text-red-500 ml-0.5">*</span>}</label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder} required={required} step={step} min={min}
      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all"/>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function PresenceEyeAnalytics() {
  const [tab, setTab]   = useState('overview');
  const [data, setData] = useState({});
  const [busy, setBusy] = useState({});
  const [ts,   setTs]   = useState(new Date());

  const [onlineDuration, setOnlineDuration] = useState('daily');

  const TABS = ['overview','engagement','revenue','hardware','map','plans','report','alerts'];
  const DURATION_OPTS = [
    {value:'daily',  label:'Day'},
    {value:'weekly', label:'Week'},
    {value:'monthly',label:'Month'},
    {value:'yearly', label:'Year'},
  ];

  // ─── Data loader ───────────────────────────────────────────────────────────
  const load = useCallback(async (section, extra={}) => {
    setBusy(p=>({...p,[section]:true}));
    const token = returnToken();
    try {
      if (section==='overview') {
        const {data:d,error} = await fetchData(`${presence_server}/api/analytics/summary`, token);
        if (!error&&d) setData(p=>({...p,overview:d}));

      } else if (section==='engagement') {
        const dur = extra.duration || onlineDuration;
        const [uR,hR,fR,frR] = await Promise.all([
          fetchData(`${presence_server}/api/analytics/engagement/active-users`, token),
          fetchData(`${presence_server}/api/analytics/engagement/heatmap`, token),
          fetchData(`${presence_server}/api/analytics/engagement/feature-adoption`, token),
          fetchData(`${presence_server}/api/analytics/engagement/frequency?duration=${dur}`, token),
        ]);
        setData(p=>({...p, engagement:{
          users:    (!uR.error&&uR.data) ? uR.data : {},
          heatmap:  (!hR.error&&Array.isArray(hR.data)) ? hR.data : [],
          features: (!fR.error&&fR.data) ? fR.data : {},
          freq:     (!frR.error&&frR.data) ? frR.data : {},
        }}));

      } else if (section==='revenue') {
        const [rR,fR,pR] = await Promise.all([
          fetchData(`${presence_server}/api/analytics/revenue`, token),
          fetchData(`${presence_server}/api/analytics/revenue/funnel`, token),
          fetchData(`${presence_server}/api/analytics/plans`, token),
        ]);
        setData(p=>({...p, revenue:{
          rev:    (!rR.error&&rR.data) ? rR.data : {},
          funnel: (!fR.error&&fR.data) ? fR.data : {},
          plans:  (!pR.error&&Array.isArray(pR.data)) ? pR.data : [],
        }}));

      } else if (section==='hardware') {
        const [hR,rR] = await Promise.all([
          fetchData(`${presence_server}/api/analytics/hardware`, token),
          fetchData(`${presence_server}/api/analytics/hardware/reliability`, token),
        ]);
        setData(p=>({...p, hardware:{
          hw:  (!hR.error&&hR.data) ? hR.data : {},
          rel: (!rR.error&&rR.data) ? rR.data : {},
        }}));

      } else if (section==='map') {
        const {data:d,error} = await fetchData(`${presence_server}/api/analytics/hardware/locations`, token);
        setData(p=>({...p, locations: (!error&&Array.isArray(d)) ? d : []}));

      } else if (section==='plans') {
        const {data:d,error} = await fetchData(`${presence_server}/api/analytics/plans`, token);
        setData(p=>({...p, plans: (!error&&Array.isArray(d)) ? d : []}));

      } else if (section==='report') {
        const date = extra.date || new Date().toISOString().slice(0,10);
        const {data:d,error} = await fetchData(`${presence_server}/api/analytics/daily-report?date=${date}`, token);
        if (!error&&d) setData(p=>({...p, report:d}));

      } else if (section==='growth') {
        const {data:d,error} = await fetchData(`${presence_server}/api/analytics/growth`, token);
        if (!error&&d) setData(p=>({...p,growth:d}));

      } else if (section==='alerts') {
        const {data:d,error} = await fetchData(`${presence_server}/api/analytics/alerts`, token);
        if (!error&&d) setData(p=>({...p,alerts:d}));
      }
    } catch(e) {
      console.error(`[Analytics] ${section}:`, e);
    } finally {
      setBusy(p=>({...p,[section]:false}));
      setTs(new Date());
    }
  }, [onlineDuration]);

  useEffect(()=>{
    load('overview');
    if (!['overview','map','plans','report'].includes(tab)) load(tab);
    if (tab==='map')    load('map');
    if (tab==='plans')  load('plans');
    if (tab==='report') load('report');
  }, [tab, load]);

  const loading    = s => !!busy[s];
  const alertCount = data.alerts?.totalAlerts || data.overview?.alerts?.totalAlerts || 0;

  // ─── Duration change re-fetches engagement ────────────────────────────────
  const handleDurationChange = dur => {
    setOnlineDuration(dur);
    load('engagement', { duration: dur });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // OVERVIEW
  // ═══════════════════════════════════════════════════════════════════════════
  const Overview = () => {
    const ov  = data.overview || {};
    const ats = ov.alerts    || {};
    const mrrTrend = safe(ov.revenue?.mrrTrend).map(m=>({month:monthLabel(m.year,m.month),Revenue:m.newRevenue||0}));
    const signups  = safe(ov.growth?.monthlySignups).slice(-6).map(m=>({month:monthLabel(m.year,m.month),Users:m.newUsers||0}));

    const cards = [
      {icon:MdPeople,      color:C.primary,      label:'Monthly Active Users',   value:ov.activeUsers?.mau,  sub:`DAU ${ov.activeUsers?.dau??'—'} · WAU ${ov.activeUsers?.wau??'—'}`, info:'Unique users who triggered a gate open event this month.'},
      {icon:MdAttachMoney, color:C.accent,        label:'Monthly Revenue',         value:fmt(ov.revenue?.mrr||0), sub:`ARPU: ${fmt(ov.revenue?.arpu||0)}`, info:'Total subscription income this month.'},
      {icon:MdDevices,     color:'#6B8BD4',       label:'Devices Sold',            value:safe(ov.hardware?.stateByModel).filter(m=>m.state==='sold').reduce((s,m)=>s+m.count,0)||'—', sub:`${ov.hardware?.agingInventory??'—'} aging in warehouse`},
      {icon:MdCreditCard,  color:C.accentWarm,    label:'Active Subscriptions',    value:ov.revenue?.totalActiveSubscriptions, sub:`Churn: ${ov.funnel?.churnRate??'—'}%`},
      {icon:MdWarning,     color:(ats.totalAlerts||0)>0?C.danger:C.primary, label:'Open Alerts', value:ats.totalAlerts, sub:`${ats.subscriptionsInGracePeriod??'—'} in grace period`},
      {icon:MdSignalWifi4Bar, color:C.primaryLight, label:'Device Online Rate',
        value: ov.hardware?.totalSoldDevices ? `${(((ov.hardware.totalSoldDevices-(ov.hardware.silentDevicesCount||0))/ov.hardware.totalSoldDevices)*100).toFixed(0)}%` : '—',
        sub:`${ov.hardware?.silentDevicesCount??'—'} silent >3 days`},
    ];

    return (
      <div className="space-y-5 sm:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {cards.map(c=><Stat key={c.label} {...c} loading={loading('overview')}/>)}
        </div>
        {(ats.totalAlerts||0)>0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3 flex-1">
              <MdWarning size={20} className="text-red-500 flex-shrink-0"/>
              <div>
                <p className="text-sm font-black text-red-700">{ats.totalAlerts} issue{ats.totalAlerts>1?'s':''} need attention</p>
                <p className="text-[11px] text-red-400 mt-0.5">{ats.stuckPendingSubscriptions??0} stuck · {ats.subscriptionsInGracePeriod??0} grace · {ats.billingAnomalies??0} billing</p>
              </div>
            </div>
            <button onClick={()=>setTab('alerts')} className="self-start px-4 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors">Review →</button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card title="Revenue Trajectory" subtitle="Monthly collected">
            {loading('overview') ? <Sk cls="h-44 w-full"/> : mrrTrend.length>0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mrrTrend} margin={{top:4,right:4,left:-10,bottom:0}}>
                  <defs><linearGradient id="gMrr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.primary} stopOpacity={0.18}/><stop offset="95%" stopColor={C.primary} stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} interval={1}/>
                  <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} width={35}/>
                  <Tooltip content={<CTip cur="RWF"/>}/>
                  <Area type="monotone" dataKey="Revenue" stroke={C.primary} fill="url(#gMrr)" strokeWidth={2} dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : <Empty msg="Revenue will appear once subscriptions are activated"/>}
          </Card>
          <Card title="User Growth" subtitle="New signups — last 6 months">
            {loading('overview') ? <Sk cls="h-44 w-full"/> : signups.length>0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={signups} margin={{top:4,right:4,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} allowDecimals={false} width={28}/>
                  <Tooltip content={<CTip/>}/>
                  <Line type="monotone" dataKey="Users" stroke={C.accent} strokeWidth={2.5} dot={{r:3,fill:C.accent,strokeWidth:2,stroke:'#fff'}} activeDot={{r:5}}/>
                </LineChart>
              </ResponsiveContainer>
            ) : <Empty msg="Signup trend will appear as users register"/>}
          </Card>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  const Engagement = () => {
    const eng     = data.engagement || {};
    const users   = eng.users    || {};
    const heatmap = safe(eng.heatmap);
    const feats   = eng.features || {};
    const freq    = eng.freq     || {};

    // Snapshot from /frequency endpoint
    const snap         = freq.snapshot      || {};
    const onlineTrend  = safe(freq.onlineTrend);
    const dailyFreq    = safe(freq.dailyFrequency);

    const grid = Array.from({length:7},(_,day)=>
      Array.from({length:24},(_,hr)=>{
        const f = heatmap.find(h=>h.dayOfWeek===day+1&&h.hour===hr);
        return f?.count||0;
      })
    );
    const maxH = heatmap.length>0 ? Math.max(...heatmap.map(h=>h.count||0),1) : 1;

    const press = safe(feats.pressTypeDistribution).map(p=>({
      name:(p._id||'unknown')[0].toUpperCase()+(p._id||'unknown').slice(1),
      value:p.count||0,
    }));

    const sharingPct = parseFloat(feats.sharing?.percent||0);
    const multiPct   = parseFloat(feats.multiDevice?.percent||0);

    const avgFreq    = dailyFreq.length>0 ? (dailyFreq.reduce((s,r)=>s+parseFloat(r.avgOpensPerDevice||0),0)/dailyFreq.length).toFixed(2) : null;
    const highMargin = avgFreq ? (parseFloat(avgFreq)*1.3).toFixed(2) : null;
    const lowMargin  = avgFreq ? (parseFloat(avgFreq)*0.7).toFixed(2) : null;

    return (
      <div className="space-y-5 sm:space-y-8">
        <Section icon={MdBubbleChart} title="Engagement & Adoption" subtitle="Is the app becoming a daily habit?"/>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {label:'Daily Active',     value:users.dau, sub:'Last 24h',    info:'Unique users who pressed a gate button today. Source: DeviceUsageEvent.userId distinct.'},
            {label:'Weekly Active',    value:users.wau, sub:'Last 7 days', info:'Source: DeviceUsageEvent — distinct users in last 7 days.'},
            {label:'Monthly Active',   value:users.mau, sub:'Last 30 days',info:'Source: DeviceUsageEvent — distinct users in last 30 days.'},
            {label:'Stickiness',       value:`${users.stickinessRatio??'—'}%`, sub:'DAU÷WAU ratio',info:'DAU ÷ WAU × 100. Aim for 30%+ for a daily-use gate opener.'},
          ].map(c=><KPI key={c.label} {...c} loading={loading('engagement')}/>)}
        </div>

        {/* Live Online Devices + Online Trend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:`${C.accent}18`}}>
                <MdWifi size={20} style={{color:C.accent}}/>
              </div>
              <Info text={"Online Now = Sold devices with a DeviceDailySession entry in last 3 days.\nLive = DeviceStatusLog status='online' in last 15 min."}/>
            </div>
            {loading('engagement') ? <><Sk cls="h-9 w-20 mb-2"/><Sk cls="h-3 w-28"/></> : (
              <>
                <div>
                  <p className="text-4xl font-black" style={{color:C.accent}}>{snap.onlineNow??'—'}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Devices Online (3-day)</p>
                  {snap.totalSold>0 && <p className="text-xs text-gray-400 mt-0.5">{snap.onlinePercent}% of {snap.totalSold} sold</p>}
                  {snap.liveOnline>0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
                      <span className="text-[10px] text-green-600 font-bold">{snap.liveOnline} live right now</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${snap.onlinePercent||0}%`,background:C.accent}}/>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-gray-400">0</span>
                  <span className="text-[9px] text-gray-400">{snap.totalSold??'—'} sold</span>
                </div>
              </>
            )}
          </div>

          <div className="sm:col-span-2">
            <Card title="Online Devices vs Sold — Trend" subtitle="% of sold fleet online over time"
              info={"Source: DeviceDailySession — distinct serialNumbers per period ÷ total sold Remotes × 100.\n\nDaily = devices with a session that day.\nWeekly/Monthly/Yearly = devices seen at least once in that period.\n\n80% line = healthy fleet. 50% = warning."}
              action={<DurationPicker value={onlineDuration} onChange={handleDurationChange} options={DURATION_OPTS}/>}>
              {loading('engagement') ? <Sk cls="h-52 w-full"/> : onlineTrend.length>0 ? (
                <ResponsiveContainer width="100%" height={210}>
                  <LineChart data={onlineTrend} margin={{top:8,right:8,left:-10,bottom:0}}>
                    <defs><linearGradient id="gOnl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.accent} stopOpacity={0.15}/><stop offset="95%" stopColor={C.accent} stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                    <XAxis dataKey="label" tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} interval="preserveStartEnd"/>
                    <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} domain={[0,100]} tickFormatter={v=>`${v}%`} width={36}/>
                    <Tooltip content={<CTip/>}/>
                    <ReferenceLine y={80} stroke={C.accent}  strokeDasharray="4 3" strokeWidth={1.5} label={{value:'80% target',position:'insideTopRight',fontSize:8,fill:C.accent}}/>
                    <ReferenceLine y={50} stroke={C.danger}  strokeDasharray="4 3" strokeWidth={1.5} label={{value:'50% warn',position:'insideTopRight',fontSize:8,fill:C.danger}}/>
                    <Area type="monotone" dataKey="Online %" stroke={C.accent} fill="url(#gOnl)" strokeWidth={2.5} dot={{r:3,fill:C.accent,strokeWidth:2,stroke:'#fff'}} activeDot={{r:5}}/>
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty msg="Online trend comes from DeviceDailySession. Trend populates as devices go online over multiple days."/>
              )}
              <div className="flex items-center gap-4 mt-2 pl-1">
                <div className="flex items-center gap-1.5"><div className="w-4 border-t-2 border-dashed" style={{borderColor:C.accent}}/><span className="text-[9px] text-gray-400 font-bold">80% — Good</span></div>
                <div className="flex items-center gap-1.5"><div className="w-4 border-t-2 border-dashed" style={{borderColor:C.danger}}/><span className="text-[9px] text-gray-400 font-bold">50% — Warning</span></div>
              </div>
            </Card>
          </div>
        </div>

        {/* Daily Usage Frequency */}
        <Card title="Daily Usage Frequency" subtitle="Avg gate opens per active device per day"
          info={"Source: DeviceUsageEvent\nFORMULA: totalOpens ÷ distinct serialNumbers that day.\n\nMargin lines = ±30% from 30-day rolling average.\nAbove upper = unusually high (stuck button?).\nBelow lower = devices going idle or users churning."}>
          {loading('engagement') ? <Sk cls="h-56 w-full"/> : dailyFreq.length>0 ? (
            <div>
              {avgFreq && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">30d Avg</span>
                    <span className="text-sm font-black text-[#1A2E2A]">{avgFreq} opens/device/day</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 rounded-xl px-3 py-1.5">
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">+30%</span>
                    <span className="text-sm font-black text-green-700">{highMargin}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 rounded-xl px-3 py-1.5">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">−30%</span>
                    <span className="text-sm font-black text-red-600">{lowMargin}</span>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={dailyFreq} margin={{top:8,right:8,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                  <XAxis dataKey="label" tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} interval="preserveStartEnd"/>
                  <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} width={28}/>
                  <Tooltip content={<CTip/>}/>
                  {avgFreq    && <ReferenceLine y={parseFloat(avgFreq)}    stroke={C.muted}  strokeDasharray="5 3" strokeWidth={1.5}/>}
                  {highMargin && <ReferenceLine y={parseFloat(highMargin)} stroke={C.accent} strokeDasharray="3 3" strokeWidth={1.5} label={{value:`+30% (${highMargin})`,position:'insideTopLeft',fontSize:8,fill:C.accent}}/>}
                  {lowMargin  && <ReferenceLine y={parseFloat(lowMargin)}  stroke={C.danger} strokeDasharray="3 3" strokeWidth={1.5} label={{value:`-30% (${lowMargin})`,position:'insideBottomLeft',fontSize:8,fill:C.danger}}/>}
                  <Line type="monotone" dataKey="avgOpensPerDevice" name="Opens/Device" stroke={C.primary} strokeWidth={2.5} dot={{r:2.5,fill:C.primary,strokeWidth:1.5,stroke:'#fff'}} activeDot={{r:5}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : <Empty msg="Frequency data comes from DeviceUsageEvent. Populates as users interact with devices."/>}
        </Card>

        {/* Heatmap + Press + Adoption */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card title="Peak Usage Heatmap" subtitle="Gate opens by hour × day (30 days)" info="Source: DeviceUsageEvent.timestamp, grouped by hour and dayOfWeek.">
            {loading('engagement') ? <Sk cls="h-48 w-full"/> : (
              <div className="overflow-x-auto">
                <div style={{minWidth:280}}>
                  <div className="flex items-center gap-px mb-1 pl-8">
                    {Array.from({length:24},(_,i)=>(
                      <div key={i} className="flex-1 text-center font-bold" style={{fontSize:'6px',color:'#D1D5DB'}}>{i%6===0?`${i}h`:''}</div>
                    ))}
                  </div>
                  {grid.map((row,di)=>(
                    <div key={di} className="flex items-center gap-px mb-px">
                      <div className="w-7 text-right pr-1 flex-shrink-0 font-black text-gray-400" style={{fontSize:'7px'}}>{DAYS[di].slice(0,2)}</div>
                      {row.map((v,hi)=><div key={hi} className="flex-1"><HC v={v} max={maxH}/></div>)}
                    </div>
                  ))}
                  <div className="flex items-center justify-end gap-1.5 mt-3">
                    <span style={{fontSize:'8px'}} className="text-gray-400 font-bold">Less</span>
                    {[0.06,0.25,0.5,0.75,0.96].map((v,i)=>(
                      <div key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm" style={{background:`rgba(25,92,81,${v})`}}/>
                    ))}
                    <span style={{fontSize:'8px'}} className="text-gray-400 font-bold">More</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card title="Button Press Types" subtitle="Short / Long / Double" info="Source: DeviceUsageEvent.pressType">
              {loading('engagement') ? <Sk cls="h-36 w-full"/> : press.length>0 ? (
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={press} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" nameKey="name" paddingAngle={3}>
                      {press.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip formatter={v=>v.toLocaleString()}/>
                    <Legend wrapperStyle={{fontSize:'9px',fontWeight:'800',textTransform:'uppercase'}}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : <Empty msg="No press events yet"/>}
            </Card>

            <Card title="Feature Adoption" subtitle="% of device owners using advanced features"
              info={"SHARING RATE = owners who created at least one Share ÷ total device owners × 100.\nThis is the most important retention signal — shared access locks in households.\n\nMULTI-DEVICE = owners with 2+ sold Remotes.\nSource: Remote collection."}>
              {loading('engagement') ? <Sk cls="h-32 w-full"/> : (
                <div className="space-y-4 pt-1">
                  <div className="p-3 bg-[#2DC87A]/5 rounded-xl border border-[#2DC87A]/20">
                    <div className="flex justify-between items-baseline mb-2">
                      <div>
                        <span className="text-xs font-black text-[#195C51]">Sharing Rate</span>
                        <span className="ml-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">KEY METRIC</span>
                      </div>
                      <span className="text-sm font-black text-[#195C51]">{sharingPct}% <span className="text-[10px] font-normal text-gray-400">({feats.sharing?.count||0})</span></span>
                    </div>
                    <div className="h-3 bg-[#2DC87A]/15 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.min(sharingPct,100)}%`,background:C.accent}}/>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">
                      {sharingPct<15 ? '⚠️ Low — review the sharing UX flow.' : sharingPct<40 ? '↗ Growing — promote sharing during onboarding.' : '✅ Strong — app is genuinely useful in households.'}
                    </p>
                  </div>
                  <Bar2 label="Multi-Device Owners" sublabel={`${multiPct}%  (${feats.multiDevice?.count||0} users)`} value={multiPct} color={C.primary} note="Owners with 2+ devices — best upsell targets."/>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // REVENUE + PLANS
  // ═══════════════════════════════════════════════════════════════════════════
  const Revenue = () => {
    const rev    = data.revenue?.rev    || {};
    const funnel = data.revenue?.funnel || {};

    const mrrTrend = safe(rev.mrrTrend).map(m=>({month:monthLabel(m.year,m.month),'Revenue (RWF)':m.newRevenue||0}));
    const methods  = safe(rev.revenueByMethod).map(m=>({name:(m._id||'unknown').toUpperCase(),Revenue:m.totalRevenue||0}));
    const statuses = safe(funnel.statusBreakdown).map(s=>({name:(s._id||'unknown').replace('_',' '),value:s.count||0}));
    const steps    = funnel.funnel ? [
      {name:'Registered',  value:funnel.funnel.registeredUsers||0,         color:'#6B8BD4'},
      {name:'Has Device',  value:funnel.funnel.usersWithDevices||0,        color:C.primary},
      {name:'Subscriber',  value:funnel.funnel.usersWithSubscriptions||0,  color:C.accent},
    ] : [];
    const top = steps[0]?.value||1;

    const kpis = [
      {label:'MRR',         value:fmt(rev.mrr||0),        sub:'Monthly recurring revenue',  info:'SUM of pricingSnapshot.pricePerMonth for all active subscriptions.'},
      {label:'ARPU',        value:fmt(rev.arpu||0),        sub:'Avg revenue per subscriber', info:'MRR ÷ active subscriber count.'},
      {label:'Active Subs', value:rev.totalActiveSubscriptions, sub:'Paying customers now',  info:'COUNT where status = active | trial | grace_period.'},
      {label:'Churn Rate',  value:`${funnel.churnRate??'—'}%`, sub:'Last 90 days',           info:'Cancelled + expired in 90d ÷ subscribers 90d ago × 100.'},
    ];

    return (
      <div className="space-y-5 sm:space-y-8">
        <Section icon={MdAttachMoney} title="Revenue & Subscription Health" subtitle="Is the business model working?"/>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpis.map(k=><KPI key={k.label} {...k} loading={loading('revenue')}/>)}
        </div>

        <div className="bg-[#195C51]/5 border border-[#195C51]/15 rounded-2xl px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#195C51] mb-2">Formula Reference</p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-[11px] text-gray-600">
            <p><b>MRR</b> = Σ pricePerMonth of active subscriptions</p>
            <p><b>ARPU</b> = MRR ÷ active subscriber count</p>
            <p><b>Churn</b> = cancelled/expired 90d ÷ subscribers 90d ago × 100</p>
            <p><b>Trial→Paid</b> = converted trials ÷ total trials × 100</p>
          </div>
        </div>

        <Card title="Revenue Trend — 12 Months" subtitle="Total collected per month" info="Source: Subscription.pricingSnapshot.totalPaid grouped by createdAt month.">
          {loading('revenue') ? <Sk cls="h-56 w-full"/> : mrrTrend.length>0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={mrrTrend} margin={{top:4,right:4,left:-5,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} width={38}/>
                <Tooltip content={<CTip cur="RWF"/>}/>
                <Bar dataKey="Revenue (RWF)" fill={C.primary} radius={[5,5,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty msg="Revenue will appear once subscriptions are activated"/>}
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card title="Subscription Status Mix" info={"COUNT of subscriptions per status value.\nActive = paying. Grace = expired but still has access. Trial = free period."}>
            {loading('revenue') ? <Sk cls="h-52 w-full"/> : statuses.length>0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={statuses} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" nameKey="name" paddingAngle={2}>
                    {statuses.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={v=>`${v} subscribers`}/>
                  <Legend wrapperStyle={{fontSize:'9px',fontWeight:'800',textTransform:'uppercase'}}/>
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty msg="No subscription data yet"/>}
          </Card>

          <Card title="Revenue by Payment Method" info="SUM of totalPaid grouped by paymentMethod.">
            {loading('revenue') ? <Sk cls="h-52 w-full"/> : methods.length>0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={methods} layout="vertical" margin={{left:4,right:8}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false}/>
                  <XAxis type="number" tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
                  <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#6B8279',fontWeight:'800'}} tickLine={false} axisLine={false} width={44}/>
                  <Tooltip content={<CTip cur="RWF"/>}/>
                  <Bar dataKey="Revenue" fill={C.accent} radius={[0,5,5,0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty msg="No payment data yet"/>}
          </Card>

          <Card title="Conversion Funnel" info={"Registered = COUNT verified Users.\nHas Device = distinct Remote.owner (state=sold).\nSubscriber = distinct Subscription.user (active).\nConversion % = step ÷ registered × 100."}>
            {loading('revenue') ? <Sk cls="h-52 w-full"/> : steps.length>0 ? (
              <div className="space-y-4 pt-2">
                {steps.map(s=>{
                  const p = top>0 ? ((s.value/top)*100).toFixed(0) : 0;
                  return (
                    <div key={s.name}>
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-xs font-bold text-gray-600">{s.name}</span>
                        <span className="text-xs font-black text-[#1A2E2A]">{(s.value||0).toLocaleString()} <span className="text-gray-400 font-normal">({p}%)</span></span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{width:`${p}%`,background:s.color}}/>
                      </div>
                    </div>
                  );
                })}
                {funnel.trial && (
                  <div className="mt-2 p-3 bg-[#195C51]/5 rounded-xl border border-[#195C51]/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#195C51]">Trial → Paid</p>
                        <p className="text-xs text-gray-400 mt-0.5">{funnel.trial.trialsToPaid} of {funnel.trial.totalTrials}</p>
                      </div>
                      <p className="text-2xl font-black text-[#195C51]">{funnel.trial.conversionRate}%</p>
                    </div>
                  </div>
                )}
              </div>
            ) : <Empty msg="Funnel populates as users subscribe"/>}
          </Card>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HARDWARE
  // ═══════════════════════════════════════════════════════════════════════════
  const Hardware = () => {
    const hw  = data.hardware?.hw  || {};
    const rel = data.hardware?.rel || {};
    const sales  = safe(hw.salesTrend).map(m=>({month:monthLabel(m.year,m.month),'Units Sold':m.unitsSold||0}));
    const modelMap = {};
    safe(hw.stateByModel).forEach(item=>{
      const k=item.modelType;
      if(!modelMap[k]) modelMap[k]={model:k.toUpperCase(),instore:0,sold:0};
      modelMap[k][item.state]=item.count;
    });
    const models=Object.values(modelMap);
    const fw=safe(hw.firmwareDistribution).slice(0,6).map(f=>({name:f._id||'unknown',value:f.count||0}));
    const relCards=[
      {label:'Total Sold',     value:rel.totalSoldDevices,         sub:'Deployed with customers',           color:C.primary,    info:'COUNT of Remotes where state = sold.'},
      {label:'Silent Devices', value:rel.silentDevicesCount,       sub:`${rel.silentDevicesPercent??'—'}% offline >3d`, color:C.danger, info:'Sold Remotes with no DeviceDailySession entry in last 3 days.'},
      {label:'Avg Uptime',     value:`${rel.avgDailyUptimeHours??'—'}h`, sub:'Per device — 30d avg',        color:C.accent,     info:'AVG of DeviceDailySession.totalOnlineSeconds ÷ 3600 per device.'},
      {label:'Aging Stock',    value:hw.agingInventory,            sub:'In warehouse >60 days',             color:C.accentWarm, info:'COUNT of Remotes where state=instore AND createdAt < 60 days ago.'},
    ];
    return (
      <div className="space-y-5 sm:space-y-8">
        <Section icon={MdDevices} title="Hardware & Inventory" subtitle="Sales, reliability and firmware"/>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {relCards.map(c=><KPI key={c.label} {...c} loading={loading('hardware')}/>)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card title="Device Sales — 12 Months" subtitle="Units sold per month" info="Source: Remote where state=sold, grouped by updatedAt month.">
            {loading('hardware') ? <Sk cls="h-52 w-full"/> : sales.length>0 ? (
              <ResponsiveContainer width="100%" height={215}>
                <AreaChart data={sales} margin={{top:4,right:4,left:-10,bottom:0}}>
                  <defs><linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6B8BD4" stopOpacity={0.2}/><stop offset="95%" stopColor="#6B8BD4" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                  <XAxis dataKey="month" tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} allowDecimals={false} width={25}/>
                  <Tooltip content={<CTip/>}/>
                  <Area type="monotone" dataKey="Units Sold" stroke="#6B8BD4" fill="url(#gS)" strokeWidth={2.5} dot={{r:3,fill:'#6B8BD4',strokeWidth:2,stroke:'#fff'}}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : <Empty msg="Sales data will appear as devices are sold"/>}
          </Card>
          <Card title="Inventory by Model" info="Source: Remote stateByModel aggregate.">
            {loading('hardware') ? <Sk cls="h-52 w-full"/> : models.length>0 ? (
              <ResponsiveContainer width="100%" height={215}>
                <BarChart data={models} margin={{top:4,right:4,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                  <XAxis dataKey="model" tick={{fontSize:9,fill:'#9CA3AF',fontWeight:'800'}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} allowDecimals={false} width={25}/>
                  <Tooltip content={<CTip/>}/>
                  <Bar dataKey="instore" name="In Store" fill="#E5E7EB" radius={[3,3,0,0]}/>
                  <Bar dataKey="sold"    name="Sold"     fill={C.primary} radius={[3,3,0,0]}/>
                  <Legend wrapperStyle={{fontSize:'9px',fontWeight:'800',textTransform:'uppercase'}}/>
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty msg="Inventory loading…"/>}
          </Card>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card title="Firmware Distribution" info="Source: DeviceStatusLog — latest firmware field per device.">
            {loading('hardware') ? <Sk cls="h-44 w-full"/> : fw.length>0 ? (
              <ResponsiveContainer width="100%" height={185}>
                <PieChart>
                  <Pie data={fw} cx="50%" cy="50%" outerRadius={72} dataKey="value" nameKey="name" paddingAngle={2}>
                    {fw.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={v=>`${v} devices`}/>
                  <Legend wrapperStyle={{fontSize:'9px',fontWeight:'800',textTransform:'uppercase'}}/>
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty msg="No firmware data yet"/>}
          </Card>
          <Card title="Multi-Device Buyers" subtitle="Customers with 2+ devices">
            {loading('hardware') ? <Sk cls="h-44 w-full"/> : (
              <div className="flex flex-col items-center justify-center h-44 gap-3">
                <div className="w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center" style={{borderColor:C.primary}}>
                  <p className="text-4xl font-black text-[#1A2E2A]">{hw.multiDeviceBuyers??'—'}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-0.5">Customers</p>
                </div>
                <p className="text-[11px] text-gray-400 text-center">Best upsell targets for higher-tier plans.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAP — Device Locations
  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════
  // MAP — Interactive Device Pins (Leaflet + OpenStreetMap, no API key)
  // ═══════════════════════════════════════════════════════════════════════════
  const MapView = () => {
    const locations   = safe(data.locations);
    const mapRef      = useRef(null);       // ref to the div that holds the map
    const leafletRef  = useRef(null);       // leaflet map instance
    const markersRef  = useRef([]);         // leaflet marker instances
    const [selected,  setSelected]  = useState(null);
    const [leafletReady, setLeafletReady] = useState(false);
    const [filterModel, setFilterModel]   = useState('all');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all'|'enabled'|'disabled'

    const hasLocations = locations.length > 0;
    const models = ['all', ...new Set(locations.map(d => d.modelType).filter(Boolean))];

    const filtered = locations.filter(d => {
      if (filterModel  !== 'all' && d.modelType !== filterModel) return false;
      if (filterStatus === 'enabled'  && !d.isEnabled)  return false;
      if (filterStatus === 'disabled' &&  d.isEnabled)  return false;
      return true;
    });

    const onlineCount   = locations.filter(d =>  d.isEnabled).length;
    const disabledCount = locations.filter(d => !d.isEnabled).length;

    // ── Load Leaflet dynamically (no npm install needed) ──────────────────────
    useEffect(() => {
      if (window.L) { setLeafletReady(true); return; }
      // Load Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id   = 'leaflet-css';
        link.rel  = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      // Load Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLeafletReady(true);
      script.onerror = () => console.warn('[Map] Leaflet failed to load — check network');
      document.head.appendChild(script);
    }, []);

    // ── Init / update map whenever Leaflet is ready or locations change ────────
    useEffect(() => {
      if (!leafletReady || !mapRef.current || !hasLocations) return;
      const L = window.L;

      // Init map once
      if (!leafletRef.current) {
        leafletRef.current = L.map(mapRef.current, { zoomControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://openstreetmap.org">OSM</a>',
          maxZoom: 19,
        }).addTo(leafletRef.current);
      }

      const map = leafletRef.current;

      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (filtered.length === 0) return;

      const bounds = [];

      filtered.forEach(d => {
        const color  = d.isEnabled ? '#2DC87A' : '#E84040';
        const border = d.isEnabled ? '#166B45' : '#B91C1C';

        // Custom SVG pin marker
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            position:relative;
            width:32px;
            height:40px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
          ">
            <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" width="32" height="40">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z"
                fill="${color}" stroke="${border}" stroke-width="1.5"/>
              <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
              <text x="16" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="${border}" font-family="monospace">
                ${(d.modelType||'?')[0].toUpperCase()}
              </text>
            </svg>
          </div>`,
          iconSize:   [32, 40],
          iconAnchor: [16, 40],
          popupAnchor:[0, -42],
        });

        const marker = L.marker([d.lat, d.lng], { icon });

        // Popup on click
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:180px;padding:4px 0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
              <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0"></div>
              <strong style="font-size:12px;color:#1A2E2A">${d.label || d.serialNumber}</strong>
            </div>
            <div style="font-size:10px;color:#6B7280;margin-bottom:2px">${d.serialNumber}</div>
            <div style="margin:6px 0;padding:4px 8px;background:#F3F4F6;border-radius:6px;font-size:10px">
              <div><b>Model:</b> ${(d.modelType||'unknown').toUpperCase()}</div>
              <div><b>Status:</b> <span style="color:${color}">${d.isEnabled ? 'Enabled' : 'Disabled'}</span></div>
              ${d.owner ? `<div><b>Owner:</b> ${d.owner}</div>` : ''}
              ${d.address ? `<div><b>Address:</b> ${d.address}</div>` : ''}
              <div><b>Coords:</b> ${d.lat.toFixed(5)}, ${d.lng.toFixed(5)}</div>
            </div>
          </div>
        `, { maxWidth: 240 });

        marker.on('click', () => setSelected(d));
        marker.addTo(map);
        markersRef.current.push(marker);
        bounds.push([d.lat, d.lng]);
      });

      // Fit map to show all markers
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }, [leafletReady, filtered.length, filterModel, filterStatus, locations]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (leafletRef.current) {
          leafletRef.current.remove();
          leafletRef.current = null;
        }
      };
    }, []);

    // Pan to selected device when list item clicked
    const flyTo = (d) => {
      setSelected(d);
      if (leafletRef.current) {
        leafletRef.current.flyTo([d.lat, d.lng], 16, { duration: 1 });
        // Open its popup
        const marker = markersRef.current.find((m, i) => filtered[i]?.serialNumber === d.serialNumber);
        if (marker) marker.openPopup();
      }
    };

    return (
      <div className="space-y-5 sm:space-y-8">
        <Section icon={MdMap} title="Device Locations" subtitle="Where are your sold devices deployed?"/>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <KPI label="Devices on Map"  value={locations.length} sub="With GPS data"      loading={loading('map')} color={C.primary}/>
          <KPI label="Enabled"         value={onlineCount}      sub="Active"             loading={loading('map')} color={C.accent}/>
          <KPI label="Disabled"        value={disabledCount}    sub="Disabled by owner"  loading={loading('map')} color={C.danger}/>
        </div>

        {loading('map') ? (
          <Sk cls="h-[500px] w-full"/>
        ) : !hasLocations ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center gap-4">
            <MdLocationOn size={40} className="text-gray-200"/>
            <div className="text-center">
              <p className="font-black text-[#1A2E2A]">No device locations available</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Devices report GPS coordinates via <code className="bg-gray-100 px-1 rounded">Remote.location.coordinates</code> when first paired.
                Locations appear here as devices come online.
              </p>
            </div>
            <button onClick={()=>load('map')}
              className="flex items-center gap-2 px-4 py-2 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors">
              <MdRefresh size={14}/> Refresh
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Model</span>
                <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
                  {models.map(m => (
                    <button key={m} onClick={()=>setFilterModel(m)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                        ${filterModel===m?'bg-[#195C51] text-white shadow-sm':'text-gray-500 hover:text-[#195C51]'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status</span>
                <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
                  {['all','enabled','disabled'].map(s => (
                    <button key={s} onClick={()=>setFilterStatus(s)}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                        ${filterStatus===s?'bg-[#195C51] text-white shadow-sm':'text-gray-500 hover:text-[#195C51]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-gray-400 ml-auto">{filtered.length} of {locations.length} shown</span>
            </div>

            {/* Map + sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Leaflet map */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#1A2E2A]">
                    {filtered.length} device{filtered.length!==1?'s':''} visible
                  </p>
                  <div className="flex items-center gap-4 text-[9px] font-bold text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <svg width="10" height="13" viewBox="0 0 32 40"><path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z" fill="#2DC87A"/></svg>
                      Enabled
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg width="10" height="13" viewBox="0 0 32 40"><path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z" fill="#E84040"/></svg>
                      Disabled
                    </span>
                    <span className="text-gray-300">· Letter = model type</span>
                  </div>
                </div>
                {!leafletReady ? (
                  <div className="h-[440px] flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin"/>
                      <p className="text-xs text-gray-400">Loading map…</p>
                    </div>
                  </div>
                ) : (
                  <div ref={mapRef} style={{height:440, width:'100%', zIndex:0}}/>
                )}
              </div>

              {/* Device list sidebar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#1A2E2A]">Devices</p>
                  <p className="text-[10px] text-gray-400">{filtered.length} listed</p>
                </div>
                <div className="overflow-y-auto flex-1" style={{maxHeight:440}}>
                  {filtered.length === 0 ? (
                    <div className="flex items-center justify-center h-24">
                      <p className="text-xs text-gray-400">No devices match filters</p>
                    </div>
                  ) : filtered.map(d => (
                    <button key={d.serialNumber} onClick={() => flyTo(d)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-[#195C51]/5 transition-colors
                        ${selected?.serialNumber===d.serialNumber ? 'bg-[#195C51]/8 border-l-[3px] border-l-[#195C51]' : ''}`}>
                      <div className="flex items-start gap-2.5">
                        {/* Colored pin icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <svg width="14" height="18" viewBox="0 0 32 40">
                            <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z"
                              fill={d.isEnabled?'#2DC87A':'#E84040'}/>
                            <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-[#1A2E2A] truncate leading-tight">
                            {d.label || d.serialNumber}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5 truncate">
                            {d.address || `${d.lat?.toFixed(4)}, ${d.lng?.toFixed(4)}`}
                          </p>
                          {d.owner && (
                            <p className="text-[9px] text-[#195C51] font-bold mt-0.5 truncate">{d.owner}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className="text-[8px] font-black text-white px-1.5 py-0.5 rounded-md uppercase"
                            style={{background: d.isEnabled ? '#195C51' : '#E84040'}}>
                            {d.modelType || '?'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected device detail strip */}
            {selected && (
              <div className="bg-[#1A2E2A] text-white rounded-2xl px-5 py-4 flex flex-wrap gap-5 items-center">
                <svg width="18" height="22" viewBox="0 0 32 40" className="flex-shrink-0">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z"
                    fill={selected.isEnabled?'#2DC87A':'#E84040'}/>
                  <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
                </svg>
                <div>
                  <p className="text-sm font-black">{selected.label || selected.serialNumber}</p>
                  <p className="text-[10px] text-gray-400">{selected.serialNumber}</p>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block"/>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Model</p>
                  <p className="text-xs font-black">{selected.modelType?.toUpperCase() || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Status</p>
                  <p className="text-xs font-black" style={{color:selected.isEnabled?'#2DC87A':'#E84040'}}>
                    {selected.isEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Owner</p>
                  <p className="text-xs font-black">{selected.owner || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Coordinates</p>
                  <p className="text-xs font-black">{selected.lat?.toFixed(5)}, {selected.lng?.toFixed(5)}</p>
                </div>
                {selected.address && (
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Address</p>
                    <p className="text-xs font-black">{selected.address}</p>
                  </div>
                )}
                {selected.ownerEmail && (
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Email</p>
                    <p className="text-xs font-black">{selected.ownerEmail}</p>
                  </div>
                )}
                <button onClick={()=>setSelected(null)} className="ml-auto text-gray-400 hover:text-white transition-colors">
                  <MdClose size={16}/>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };


  // ═══════════════════════════════════════════════════════════════════════════
  // PLANS MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  const Plans = () => {
    const plans = safe(data.plans);
    const token = returnToken();

    const emptyForm = {
      name:'', description:'', maxDevices:'', maxShares:'', maxSessions:'',
      minDurationMonths:'1', maxDurationMonths:'12', isActive:true,
      features:'',
      pricing:[{country:'RW',currency:'RWF',pricePerMonth:''},{country:'GLOBAL',currency:'USD',pricePerMonth:''}],
    };
    const [modal,    setModal]   = useState(null); // null | 'create' | 'edit'
    const [form,     setForm]    = useState(emptyForm);
    const [saving,   setSaving]  = useState(false);
    const [err,      setErr]     = useState('');
    const [deleting, setDeleting]= useState(null); // planId being deleted

    const openCreate = () => { setForm(emptyForm); setErr(''); setModal('create'); };
    const openEdit   = p  => {
      setForm({
        name:             p.name||'',
        description:      p.description||'',
        maxDevices:       String(p.maxDevices||''),
        maxShares:        String(p.maxShares||''),
        maxSessions:      String(p.maxSessions||''),
        minDurationMonths:String(p.minDurationMonths||1),
        maxDurationMonths:String(p.maxDurationMonths||12),
        isActive:         !!p.isActive,
        features:         (p.features||[]).join('\n'),
        pricing:          p.pricing?.length ? p.pricing.map(pr=>({...pr,pricePerMonth:String(pr.pricePerMonth)})) :
                          [{country:'RW',currency:'RWF',pricePerMonth:''},{country:'GLOBAL',currency:'USD',pricePerMonth:''}],
        _id:              p._id,
      });
      setErr('');
      setModal('edit');
    };

    const setF  = (k,v)  => setForm(p=>({...p,[k]:v}));
    const setPricing = (i,k,v) => setForm(p=>({...p,pricing:p.pricing.map((pr,idx)=>idx===i?{...pr,[k]:v}:pr)}));
    const addPricing = () => setForm(p=>({...p,pricing:[...p.pricing,{country:'',currency:'',pricePerMonth:''}]}));
    const rmPricing  = i => setForm(p=>({...p,pricing:p.pricing.filter((_,idx)=>idx!==i)}));

    const buildPayload = () => ({
      name:              form.name.trim(),
      description:       form.description.trim()||undefined,
      maxDevices:        parseInt(form.maxDevices,10),
      maxShares:         parseInt(form.maxShares,10),
      maxSessions:       parseInt(form.maxSessions,10),
      minDurationMonths: parseInt(form.minDurationMonths,10)||1,
      maxDurationMonths: parseInt(form.maxDurationMonths,10)||12,
      isActive:          form.isActive,
      features:          form.features.split('\n').map(s=>s.trim()).filter(Boolean),
      pricing:           form.pricing.map(p=>({
        country:     p.country.trim().toUpperCase(),
        currency:    p.currency.trim().toUpperCase(),
        pricePerMonth: parseFloat(p.pricePerMonth)||0,
      })),
    });
    const ADMIN_API_KEY = import.meta.env.VITE_API_KEY;


    const handleSave = async () => {
      setSaving(true); setErr('');
      try {
        const payload = buildPayload();
        let result;
        if (modal === 'edit') {
          result = await fetch(`${presence_server}/api/analytics/plans/${form._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_API_KEY },
            body: JSON.stringify(payload),
          });
        } else {
          result = await fetch(`${presence_server}/api/analytics/plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': ADMIN_API_KEY },
            body: JSON.stringify(payload),
          });
        }
        const d = await result.json();
        if (!result.ok) { setErr(d.message || 'Save failed'); return; }
        setModal(null);
        load('plans');
      } catch (e) {
        setErr(e.message || 'Network error');
      } finally {
        setSaving(false);
      }
    };

    const handleToggle = async planId => {
      try {
        await fetch(`${presence_server}/api/analytics/plans/${planId}/toggle`, {
          method: 'PATCH',
          headers: { 'x-api-key': ADMIN_API_KEY },
        });
        load('plans');
      } catch {}
    };

    const handleDelete = async planId => {
      setDeleting(planId);
      try {
        const res = await fetch(`${presence_server}/api/analytics/plans/${planId}`, {
          method: 'DELETE',
          headers: { 'x-api-key': ADMIN_API_KEY },
        });
        const d = await res.json();
        if (!res.ok) { alert(d.message || 'Delete failed'); return; }
        load('plans');
      } catch (e) { alert(e.message); }
      finally { setDeleting(null); }
    };

    const PlanForm = () => (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {err && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm text-red-700">{err}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Input label="Plan Name" value={form.name} onChange={v=>setF('name',v)} placeholder="Family Plan" required/></div>
          <div className="col-span-2"><Input label="Description" value={form.description} onChange={v=>setF('description',v)} placeholder="Perfect for home use"/></div>
          <Input label="Max Devices" type="number" min="1" value={form.maxDevices}   onChange={v=>setF('maxDevices',v)}   required/>
          <Input label="Max Shares"  type="number" min="0" value={form.maxShares}    onChange={v=>setF('maxShares',v)}    required/>
          <Input label="Max Sessions"type="number" min="1" value={form.maxSessions}  onChange={v=>setF('maxSessions',v)}  required/>
          <div/>
          <Input label="Min Duration (months)" type="number" min="1" value={form.minDurationMonths} onChange={v=>setF('minDurationMonths',v)}/>
          <Input label="Max Duration (months)" type="number" min="1" value={form.maxDurationMonths} onChange={v=>setF('maxDurationMonths',v)}/>
        </div>

        {/* Pricing */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pricing (per country)<span className="text-red-500 ml-0.5">*</span></label>
            <button onClick={addPricing} className="text-[9px] font-black text-[#195C51] hover:underline flex items-center gap-1"><MdAdd size={12}/>Add region</button>
          </div>
          {form.pricing.map((p,i)=>(
            <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-end">
              <Input label={i===0?"Country":""} value={p.country}      onChange={v=>setPricing(i,'country',v)}      placeholder="RW"/>
              <Input label={i===0?"Currency":""} value={p.currency}    onChange={v=>setPricing(i,'currency',v)}     placeholder="RWF"/>
              <Input label={i===0?"Price/Month":""} type="number" value={p.pricePerMonth} onChange={v=>setPricing(i,'pricePerMonth',v)} placeholder="5000"/>
              <button onClick={()=>rmPricing(i)} className="h-9 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                <MdDelete size={16}/>
              </button>
            </div>
          ))}
        </div>

        {/* Features */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Features <span className="text-gray-300">(one per line)</span></label>
          <textarea value={form.features} onChange={e=>setF('features',e.target.value)} rows={4}
            placeholder={"Mobile app access\nFull Repair\nMaintenance"}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#1A2E2A] focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 transition-all resize-none"/>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <button onClick={()=>setF('isActive',!form.isActive)}
            className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${form.isActive?'bg-[#195C51]':'bg-gray-200'}`}>
            <span className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${form.isActive?'translate-x-4':'translate-x-0'}`}/>
          </button>
          <span className="text-sm font-bold text-gray-600">{form.isActive?'Active — visible to users':'Inactive — hidden from users'}</span>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : modal==='edit' ? 'Update Plan' : 'Create Plan'}
        </button>
      </div>
    );

    return (
      <div className="space-y-5 sm:space-y-8">
        <div className="flex items-center justify-between">
          <Section icon={MdCreditCard} title="Subscription Plans" subtitle="Manage plans available to your customers"/>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors">
            <MdAdd size={14}/> New Plan
          </button>
        </div>

        {loading('plans') ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i=><Sk key={i} cls="h-52"/>)}
          </div>
        ) : plans.length===0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center gap-4">
            <MdCreditCard size={36} className="text-gray-200"/>
            <div className="text-center">
              <p className="font-black text-[#1A2E2A]">No plans yet</p>
              <p className="text-xs text-gray-400 mt-1">Create your first plan to allow customers to subscribe.</p>
            </div>
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors">
              <MdAdd size={14}/> Create First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map(p=>{
              const rwPricing = p.pricing?.find(pr=>pr.country==='RW') || p.pricing?.[0];
              return (
                <div key={p._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${p.isActive?'border-gray-100':'border-dashed border-gray-200 opacity-70'}`}>
                  {/* Plan header */}
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-black text-[#1A2E2A] text-sm leading-tight">{p.name}</h3>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${p.isActive?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                        {p.isActive?'Active':'Inactive'}
                      </span>
                    </div>
                    {p.description && <p className="text-[11px] text-gray-400 mt-0.5">{p.description}</p>}

                    {/* Price */}
                    {rwPricing && (
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-2xl font-black" style={{color:C.primary}}>{rwPricing.pricePerMonth?.toLocaleString()}</span>
                        <span className="text-xs font-bold text-gray-400">{rwPricing.currency}/mo</span>
                      </div>
                    )}

                    {/* Limits */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[
                        {label:'Devices',  val:p.maxDevices},
                        {label:'Shares',   val:p.maxShares},
                        {label:'Sessions', val:p.maxSessions},
                      ].map(l=>(
                        <div key={l.label} className="bg-gray-50 rounded-xl p-2 text-center">
                          <p className="text-sm font-black text-[#1A2E2A]">{l.val}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{l.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Duration */}
                    <p className="text-[10px] text-gray-400 mt-2">{p.minDurationMonths}–{p.maxDurationMonths} months duration</p>

                    {/* Features */}
                    {p.features?.length>0 && (
                      <div className="mt-3 space-y-1">
                        {p.features.slice(0,4).map((f,i)=>(
                          <div key={i} className="flex items-center gap-1.5">
                            <MdCheckBox size={12} style={{color:C.accent}}/>
                            <span className="text-[10px] text-gray-600">{f}</span>
                          </div>
                        ))}
                        {p.features.length>4 && <p className="text-[10px] text-gray-400">+{p.features.length-4} more</p>}
                      </div>
                    )}

                    {/* All pricing regions */}
                    {p.pricing?.length>1 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">All Regions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.pricing.map((pr,i)=>(
                            <span key={i} className="text-[9px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-lg">
                              {pr.country}: {pr.pricePerMonth?.toLocaleString()} {pr.currency}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
                    <button onClick={()=>openEdit(p)} className="flex items-center gap-1 text-[10px] font-black text-[#195C51] hover:bg-[#195C51]/5 px-2 py-1.5 rounded-lg transition-colors">
                      <MdEdit size={12}/> Edit
                    </button>
                    <button onClick={()=>handleToggle(p._id)}
                      className="flex items-center gap-1 text-[10px] font-black text-gray-500 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors">
                      {p.isActive ? <><MdToggleOff size={12}/> Deactivate</> : <><MdToggleOn size={12}/> Activate</>}
                    </button>
                    <button onClick={()=>handleDelete(p._id)} disabled={deleting===p._id}
                      className="ml-auto flex items-center gap-1 text-[10px] font-black text-red-400 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                      <MdDelete size={12}/> {deleting===p._id?'…':'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal open={modal==='create'||modal==='edit'} onClose={()=>setModal(null)} title={modal==='edit'?'Edit Plan':'Create Plan'} wide>
          <PlanForm/>
        </Modal>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  const DailyReport = () => {
    const r   = data.report;
    const [date, setDate] = useState(new Date().toISOString().slice(0,10));

    const fetchReport = () => load('report', {date});

    const summary = r?.summary || {};
    const hourly  = safe(r?.hourlyBreakdown);
    const topDev  = safe(r?.topDevices);
    const press   = safe(r?.pressTypes);
    const statusEv= safe(r?.statusEvents);

    const SummaryCard = ({ label, value, prev, delta, sub, color=C.primary }) => (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
        <p className="text-xl sm:text-2xl font-black" style={{color}}>{value??'—'}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1 leading-tight">{label}</p>
        {(delta!=null) && <div className="mt-1.5 flex items-center gap-1.5"><DeltaBadge val={delta}/><span className="text-[9px] text-gray-400">vs prev day</span></div>}
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    );

    return (
      <div className="space-y-5 sm:space-y-8">
        <Section icon={MdPictureAsPdf} title="Daily Report" subtitle="Full operational snapshot for any day"/>

        {/* Date picker + generate button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${C.primary}15`}}>
              <MdCalendarToday size={18} style={{color:C.primary}}/>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Report Date</p>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} max={new Date().toISOString().slice(0,10)}
                className="text-sm font-black text-[#1A2E2A] border-none outline-none bg-transparent mt-0.5"/>
            </div>
          </div>
          <button onClick={fetchReport} disabled={loading('report')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#195C51] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#1E7060] transition-colors disabled:opacity-50">
            {loading('report') ? <><MdRefresh size={14} className="animate-spin"/> Generating…</> : <><MdDownload size={14}/> Generate Report</>}
          </button>
        </div>

        {loading('report') ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Sk cls="h-28"/><Sk cls="h-28"/><Sk cls="h-28"/><Sk cls="h-28"/></div>
        ) : !r ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center gap-3">
            <MdCalendarToday size={32} className="text-gray-200"/>
            <p className="text-xs text-gray-400">Select a date and click Generate Report to load the day's analytics.</p>
          </div>
        ) : (
          <>
            {/* Report header */}
            <div className="bg-[#1A2E2A] text-white rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-black">{r.dateLabel}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Generated at {new Date(r.generatedAt).toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Online Rate</p>
                  <p className="text-xl font-black text-[#2DC87A]">{summary.onlineRate}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Total Opens</p>
                  <p className="text-xl font-black text-white">{summary.totalGateOpens?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard label="Gate Opens Today"      value={summary.totalGateOpens?.toLocaleString()}  delta={summary.gateOpensDelta}          color={C.primary}/>
              <SummaryCard label="Devices Interacted"    value={summary.devicesInteracted}                 delta={summary.devicesInteractedDelta}   color='#6B8BD4'   sub={`of ${summary.totalSoldDevices} sold`}/>
              <SummaryCard label="Devices Online Today"  value={summary.devicesOnlineToday}                sub={`${summary.onlineRate}% of fleet`}  color={C.accent}/>
              <SummaryCard label="Active Users"          value={summary.activeUsers}                       delta={summary.activeUsersDelta}          color={C.accentWarm}/>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard label="Avg Device Uptime"     value={`${summary.avgUptimeHours}h`}             sub="Avg online time per device"          color={C.primaryLight}/>
              <SummaryCard label="New Subscriptions"     value={summary.newSubscriptions}                 sub="Created today"                       color={C.accent}/>
              <SummaryCard label="Previous Day Opens"    value={summary.prevDayGateOpens?.toLocaleString()} sub="For comparison"                   color={C.muted}/>
              <SummaryCard label="Previous Day Users"    value={summary.prevActiveUsers}                  sub="For comparison"                      color={C.muted}/>
            </div>

            {/* Hourly chart */}
            <Card title="Gate Opens by Hour" subtitle="Full 24-hour breakdown for the day"
              info="Source: DeviceUsageEvent grouped by $hour of timestamp UTC.">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hourly} margin={{top:4,right:4,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                  <XAxis dataKey="label" tick={{fontSize:7,fill:'#9CA3AF'}} tickLine={false} axisLine={false} interval={2}/>
                  <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} allowDecimals={false} width={25}/>
                  <Tooltip content={<CTip/>}/>
                  <Bar dataKey="events" name="Opens" fill={C.primary} radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* Top devices */}
              <Card title="Top 5 Devices Today" subtitle="Most gate opens this day">
                {topDev.length>0 ? (
                  <div className="space-y-3 pt-1">
                    {topDev.map((d,i)=>(
                      <div key={d.serialNumber} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}>
                          {i+1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-[#1A2E2A] truncate">{d.label}</p>
                          <p className="text-[9px] text-gray-400 truncate">{d.serialNumber}</p>
                        </div>
                        <span className="text-sm font-black text-[#1A2E2A] flex-shrink-0">{d.opens}</span>
                      </div>
                    ))}
                  </div>
                ) : <Empty msg="No device interactions this day"/>}
              </Card>

              {/* Press types */}
              <Card title="Press Types Today" subtitle="Short / Long / Double">
                {press.length>0 ? (
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={press.map(p=>({name:(p._id||'?').charAt(0).toUpperCase()+(p._id||'').slice(1),value:p.count||0}))}
                        cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" nameKey="name" paddingAngle={3}>
                        {press.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip formatter={v=>v.toLocaleString()}/>
                      <Legend wrapperStyle={{fontSize:'9px',fontWeight:'800',textTransform:'uppercase'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : <Empty msg="No press events this day"/>}
              </Card>

              {/* Status events */}
              <Card title="Status Transitions" subtitle="Online / Offline events from DeviceStatusLog">
                {statusEv.length>0 ? (
                  <div className="space-y-3 pt-2">
                    {statusEv.map(s=>(
                      <div key={s._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s._id==='online'?'bg-[#2DC87A]':s._id==='offline'?'bg-[#E84040]':'bg-[#F0A500]'}`}/>
                          <span className="text-xs font-bold text-gray-600 capitalize">{s._id}</span>
                        </div>
                        <span className="text-sm font-black text-[#1A2E2A]">{s.count?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : <Empty msg="No status events logged this day"/>}
              </Card>
            </div>
          </>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // GROWTH
  // ═══════════════════════════════════════════════════════════════════════════
  const Growth = () => {
    const g       = data.growth || {};
    const signups = safe(g.monthlySignups).map(m=>({month:monthLabel(m.year,m.month),'New Signups':m.newUsers||0,'Verified':m.verified||0}));
    const geo     = safe(g.geoDistribution).slice(0,8).map(x=>({name:x._id||'Unknown',Users:x.count||0}));
    const kpis = [
      {label:'Total Registered', value:g.totals?.totalUsers,   sub:`All-time signups`,             color:C.primary,    info:'COUNT of all User documents.'},
      {label:'Verified Users',   value:g.totals?.verifiedUsers,sub:`${g.verificationRate??'—'}% verification rate`, color:C.accent, info:'COUNT where isVerified = true. Rate = verified ÷ total × 100.'},
      {label:'Active Accounts',  value:g.totals?.activeUsers,  sub:'Not deactivated',              color:'#6B8BD4',    info:'COUNT where status = active.'},
      {label:'Avg Shares/Device',value:g.sharingDepth?.avgShares?.toFixed(1), sub:`Max: ${g.sharingDepth?.maxShares??'—'}`, color:C.accentWarm, info:'AVG of Share count per Remote document.'},
    ];
    return (
      <div className="space-y-5 sm:space-y-8">
        <Section icon={MdTrendingUp} title="User Growth" subtitle="Who is joining and where?"/>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpis.map(k=><KPI key={k.label} {...k} loading={loading('growth')}/>)}
        </div>
        <Card title="Monthly Signups — 12 Months" info="Source: User.createdAt grouped by month. Verified bar = users with isVerified=true.">
          {loading('growth') ? <Sk cls="h-56 w-full"/> : signups.length>0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={signups} margin={{top:4,right:4,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} allowDecimals={false} width={28}/>
                <Tooltip content={<CTip/>}/>
                <Bar dataKey="New Signups" fill={`${C.primary}60`} radius={[3,3,0,0]}/>
                <Bar dataKey="Verified"    fill={C.primary}        radius={[3,3,0,0]}/>
                <Legend wrapperStyle={{fontSize:'9px',fontWeight:'800',textTransform:'uppercase'}}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty msg="Signup trend will appear as users register"/>}
        </Card>
        <Card title="Geographic Distribution" info="Source: User.country grouped. Only verified users included.">
          {loading('growth') ? <Sk cls="h-52 w-full"/> : geo.length>0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={geo} layout="vertical" margin={{left:12,right:8}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} allowDecimals={false}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:9,fill:'#6B8279',fontWeight:'800'}} tickLine={false} axisLine={false} width={38}/>
                <Tooltip content={<CTip/>}/>
                <Bar dataKey="Users" radius={[0,5,5,0]}>
                  {geo.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty msg="No geographic data yet"/>}
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ALERTS
  // ═══════════════════════════════════════════════════════════════════════════
  const Alerts = () => {
    const a   = data.alerts || {};
    const byM = safe(a.failedByMethod);
    const tot = a.totalAlerts || 0;
    return (
      <div className="space-y-5 sm:space-y-8">
        <Section icon={MdWarning} title="Operational Alerts" subtitle="Issues needing your attention"/>
        <div className={`rounded-2xl border px-4 sm:px-5 py-4 flex items-start sm:items-center gap-3 ${tot>0?'bg-red-50 border-red-100':'bg-green-50 border-green-100'}`}>
          {tot>0 ? <MdWarning size={20} className="text-red-500 flex-shrink-0 mt-0.5"/> : <MdCheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5"/>}
          <div>
            {tot>0 ? (
              <><p className="text-sm font-black text-red-700">{tot} issue{tot>1?'s':''} need attention</p>
              <p className="text-[11px] text-red-400 mt-0.5">Review each alert and act before it affects customers.</p></>
            ) : (
              <><p className="text-sm font-black text-green-700">All systems look healthy!</p>
              <p className="text-[11px] text-green-400 mt-0.5">No operational issues at this time.</p></>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">How these are detected (all from Subscription collection)</p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-[11px] text-gray-600">
            <p><b>Stuck Pending</b> = status='pending' AND updatedAt &lt; now − 24h</p>
            <p><b>Failed Payments</b> = status='failed' AND createdAt &gt; now − 30d</p>
            <p><b>Grace Period</b> = status='grace_period' (access still granted)</p>
            <p><b>Billing Anomalies</b> = status='active' AND endDate &lt; now</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading('alerts')
            ? Array.from({length:4}).map((_,i)=><Sk key={i} cls="h-32 sm:h-36"/>)
            : <>
              <AlertCard count={a.stuckPendingSubscriptions} label="Stuck Pending" icon={MdHourglassEmpty} sev={(a.stuckPendingSubscriptions||0)>0?'danger':'ok'} desc="Pending >24h. User may have paid but not been activated."/>
              <AlertCard count={a.failedPaymentsLast30Days}  label="Failed (30d)"  icon={MdErrorOutline}  sev={(a.failedPaymentsLast30Days||0)>0?'warn':'ok'} desc="Failed payment attempts. Check which provider is failing."/>
              <AlertCard count={a.subscriptionsInGracePeriod}label="Grace Period"  icon={MdTimer}         sev={(a.subscriptionsInGracePeriod||0)>0?'warn':'ok'} desc="Expired but still has access. High churn risk."/>
              <AlertCard count={a.billingAnomalies}          label="Billing Anomalies" icon={MdCreditCard} sev={(a.billingAnomalies||0)>0?'danger':'ok'} desc="Active subs past end date. Access should be revoked."/>
            </>}
        </div>

        <Card title="Failed Payments by Provider" subtitle="Last 30 days"
          info="Source: Subscription.paymentMethod grouped, status='failed', createdAt > 30d ago.">
          {loading('alerts') ? <Sk cls="h-44 w-full"/> : byM.length>0 ? (
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={byM.map(m=>({name:(m._id||'').toUpperCase(),Failures:m.count||0}))} margin={{top:4,right:4,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:10,fill:'#9CA3AF',fontWeight:'800'}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fontSize:8,fill:'#9CA3AF'}} tickLine={false} axisLine={false} allowDecimals={false} width={25}/>
                <Tooltip content={<CTip/>}/>
                <Bar dataKey="Failures" fill={C.danger} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-36 gap-3">
              <MdCheckCircle size={32} style={{color:C.accent}}/>
              <p className="text-sm font-bold text-gray-500">No failed payments in the last 30 days 🎉</p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 sm:space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#333333]">Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Product impact · Revenue · Operations</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">{ts.toLocaleTimeString()}</span>
          <button onClick={()=>load(tab)} disabled={loading(tab)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#195C51] hover:border-[#195C51]/30 transition-all disabled:opacity-50">
            <MdRefresh size={14} className={loading(tab)?'animate-spin':''}/>
            Refresh
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex bg-white p-1 sm:p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit gap-0.5 sm:gap-1">
          {[
            {id:'overview',   label:'Overview'},
            {id:'engagement', label:'Usage'},
            {id:'revenue',    label:'Revenue'},
            {id:'hardware',   label:'Hardware'},
            {id:'map',        label:'Map'},
            {id:'plans',      label:'Plans'},
            {id:'report',     label:'Report'},
            {id:'alerts',     label:'Alerts'},
          ].map(t=>(
            <Tab key={t.id} label={t.label} active={tab===t.id} onClick={()=>setTab(t.id)} badge={t.id==='alerts'?alertCount:0}/>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {tab==='overview'   && <Overview/>}
        {tab==='engagement' && <Engagement/>}
        {tab==='revenue'    && <Revenue/>}
        {tab==='hardware'   && <Hardware/>}
        {tab==='map'        && <MapView/>}
        {tab==='plans'      && <Plans/>}
        {tab==='report'     && <DailyReport/>}
        {tab==='alerts'     && <Alerts/>}
      </div>
    </div>
  );
}