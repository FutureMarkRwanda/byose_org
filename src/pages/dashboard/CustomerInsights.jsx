// src/pages/dashboard/CustomerInsights.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronRight, Activity, AlertTriangle, Trophy, Search, CalendarDays } from 'lucide-react';
import { fetchData, returnToken } from '../../utils/helper.js';
import { presence_server } from '../../config/server_api.js';
import { PrivacyNameToggle } from './DeviceInsights.jsx'; // Reuse the toggle component // Reuse the toggle component

// --- Configuration ---
const EXCLUDED_TESTER_EMAILS = [
  'guest@byose.info',
  'tester@byose.info',
];

// --- Shadcn-Simulated UI Components ---
const Card = ({ children, className = "", id }) => (
  <div id={id} className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>{children}</div>
);

// --- Time window helpers (shared by activity trend, heatmap, leaderboard) ---
const todayISO     = () => new Date().toISOString().split('T')[0];
const thisMonthISO = () => todayISO().slice(0, 7);
const thisYearNum  = () => new Date().getFullYear();

const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0);        return x; };
const endOfDay   = (d) => { const x = new Date(d); x.setHours(23,59,59,999);   return x; };

// Clamp a window's end to "now" so future timestamps never reach the backend.
const clampTo = (d) => {
  const now = new Date();
  return d.getTime() > now.getTime() ? now : d;
};

const resolveWindow = (state) => {
  const now = new Date();
  switch (state.mode) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now), label: "Today" };
    case "day": {
      const d = new Date(state.day);
      return { from: startOfDay(d), to: clampTo(endOfDay(d)), label: state.day };
    }
    case "thisWeek": {
      const dow = (now.getDay() + 6) % 7; // Monday = 0
      const start = startOfDay(new Date(now.getTime() - dow * 86400000));
      return { from: start, to: endOfDay(now), label: "This week" };
    }
    case "thisMonth": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: start, to: endOfDay(now), label: "This month" };
    }
    case "month": {
      const [y, m] = state.month.split("-").map(Number);
      const start = new Date(y, m - 1, 1);
      const end   = new Date(y, m, 0, 23, 59, 59, 999);
      return { from: start, to: clampTo(end), label: state.month };
    }
    case "thisYear": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { from: start, to: endOfDay(now), label: "This year" };
    }
    case "year": {
      const y = Number(state.year);
      return { from: new Date(y, 0, 1), to: clampTo(new Date(y, 11, 31, 23, 59, 59, 999)), label: state.year };
    }
    case "custom": {
      const f = startOfDay(new Date(state.range.from));
      const t = clampTo(endOfDay(new Date(state.range.to)));
      return { from: f, to: t, label: `${state.range.from} → ${state.range.to}` };
    }
    default:
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now), label: "This month" };
  }
};

const defaultTimeWindow = (mode = "thisMonth") => ({
  mode,
  day:   todayISO(),
  month: thisMonthISO(),
  year:  String(thisYearNum()),
  range: { from: todayISO(), to: todayISO() },
});

const YEAR_OPTIONS = (() => {
  const y = thisYearNum();
  const out = [];
  for (let i = y; i >= 2020; i--) out.push(String(i));
  return out;
})();

const TimeWindowPicker = ({ value, onChange, allowToday = true }) => {
  const set = (patch) => onChange({ ...value, ...patch });
  const modes = [
    allowToday && { id: "today",     label: "Today" },
    allowToday && { id: "day",       label: "Any day…" },
    { id: "thisWeek",  label: "This week" },
    { id: "thisMonth", label: "This month" },
    { id: "month",     label: "Any month…" },
    { id: "thisYear",  label: "This year" },
    { id: "year",      label: "Any year…" },
    { id: "custom",    label: "Custom range…" },
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={value.mode}
        onChange={(e) => set({ mode: e.target.value })}
        className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none cursor-pointer hover:border-slate-300"
      >
        {modes.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
      </select>

      {value.mode === "day" && (
        <input
          type="date"
          value={value.day}
          max={todayISO()}
          onChange={(e) => set({ day: e.target.value })}
          className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none hover:border-slate-300"
        />
      )}
      {value.mode === "month" && (
        <input
          type="month"
          value={value.month}
          max={thisMonthISO()}
          onChange={(e) => set({ month: e.target.value })}
          className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none hover:border-slate-300"
        />
      )}
      {value.mode === "year" && (
        <select
          value={value.year}
          onChange={(e) => set({ year: e.target.value })}
          className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none cursor-pointer hover:border-slate-300"
        >
          {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      )}
      {value.mode === "custom" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={value.range.from}
            max={value.range.to}
            onChange={(e) => set({ range: { ...value.range, from: e.target.value } })}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none hover:border-slate-300"
          />
          <span className="text-slate-400 text-xs">→</span>
          <input
            type="date"
            value={value.range.to}
            min={value.range.from}
            max={todayISO()}
            onChange={(e) => set({ range: { ...value.range, to: e.target.value } })}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none hover:border-slate-300"
          />
        </div>
      )}
    </div>
  );
};

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    destructive: "bg-red-100 text-red-800 border-red-200",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200"
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${variants[variant]}`}>{children}</span>;
};

export default function CustomerInsights() {
  const navigate = useNavigate();
  const token = returnToken();
  
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(true);
  
  // Real Data States
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  
  // Charts & Heatmap States
  const [fleetActivity, setFleetActivity] = useState([]);
  const [fleetHeatmap, setFleetHeatmap] = useState([]);
  const [maxHeatmapVal, setMaxHeatmapVal] = useState(1);
  
  // Table state
  const [expandedUser, setExpandedUser] = useState(null);
  const [userRemotes, setUserRemotes] = useState({});
  const [search, setSearch] = useState("");

  // Time windows — one per card, driven by the shared TimeWindowPicker
  const [activityWin,    setActivityWin]    = useState(defaultTimeWindow("thisWeek"));
  const [heatmapWin,     setHeatmapWin]     = useState(defaultTimeWindow("thisMonth"));
  const [leaderboardWin, setLeaderboardWin] = useState(defaultTimeWindow("thisMonth"));
  const [alertTime, setAlertTime] = useState(1); // 1, 7, 30, 365

  const activityRange    = useMemo(() => resolveWindow(activityWin),    [activityWin]);
  const heatmapRange     = useMemo(() => resolveWindow(heatmapWin),     [heatmapWin]);
  const leaderboardRange = useMemo(() => resolveWindow(leaderboardWin), [leaderboardWin]);
  const [roleFilter, setRoleFilter] = useState("all"); // all | owner | shared | none
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const getUserRole = (u) => {
    if ((u.devices?.owned || 0) > 0) return "owner";
    if ((u.sharing?.sharesReceived || 0) > 0) return "shared";
    return "none";
  };

  const ROLE_META = {
    owner:  { label: "Owner",     classes: "bg-[#195C51]/10 text-[#195C51] border-[#195C51]/20" },
    shared: { label: "Shared",    classes: "bg-sky-50 text-sky-700 border-sky-200" },
    none:   { label: "No device", classes: "bg-slate-100 text-slate-600 border-slate-200" },
  };

  useEffect(() => {
    loadBaseUsersAndAlerts();
  }, [alertTime]);

  useEffect(() => {
    loadActivityTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityRange.from, activityRange.to]);

  useEffect(() => {
    loadHeatmap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapRange.from, heatmapRange.to]);

  useEffect(() => {
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboardRange.from, leaderboardRange.to]);

  const loadBaseUsersAndAlerts = async () => {
    setLoading(true);
    try {
      const usersRes = await fetchData(`${presence_server}/api/admin/analytics-users?limit=100&sortBy=totalEvents&order=desc`, token);
      
      if (usersRes.data?.users) {
        const validUsers = usersRes.data.users.filter(u => !EXCLUDED_TESTER_EMAILS.includes(u.email?.toLowerCase()));
        setUsers(validUsers);

        const fromDate = new Date(Date.now() - alertTime * 86400000).toISOString().split('T')[0];
        const minIncidents = 5 * alertTime;
        const alertsRes = await fetchData(`${presence_server}/api/admin/analytics-users?offlineIncidentsMin=${minIncidents}&from=${fromDate}&limit=10`, token);
        
        if (alertsRes.data?.users) {
            const validAlerts = alertsRes.data.users.filter(u => !EXCLUDED_TESTER_EMAILS.includes(u.email?.toLowerCase()));
            setAlerts(validAlerts);
        }
      }
    } catch (error) {
      console.error("Failed to load users", error);
    }
    setLoading(false);
  };

  const loadLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const { from, to } = leaderboardRange;
      const url = `${presence_server}/api/admin/analytics-users/leaderboard?from=${from.toISOString()}&to=${to.toISOString()}&limit=5`;
      const res = await fetchData(url, token);
      if (res.data?.data) setLeaderboard(res.data.data);
      else setLeaderboard([]);
    } catch (err) {
      console.error("Failed to load leaderboard", err);
      setLeaderboard([]);
    }
    setLeaderboardLoading(false);
  };

  const loadActivityTrend = async () => {
    setTrendsLoading(true);
    try {
      const { from, to } = activityRange;
      const url = `${presence_server}/api/admin/analytics-users/fleet-trends?from=${from.toISOString()}&to=${to.toISOString()}`;
      const res = await fetchData(url, token);
      if (res.data?.data) setFleetActivity(res.data.data.activityTrend || []);
    } catch (error) {
      console.error("Failed to load activity trend", error);
    }
    setTrendsLoading(false);
  };

  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const loadHeatmap = async () => {
    setHeatmapLoading(true);
    try {
      const { from, to } = heatmapRange;
      const url = `${presence_server}/api/admin/analytics-users/fleet-trends?from=${from.toISOString()}&to=${to.toISOString()}`;
      const res = await fetchData(url, token);
      if (res.data?.data) {
        setFleetHeatmap(res.data.data.heatmap || []);
        setMaxHeatmapVal(res.data.data.maxHeatmapValue || 1);
      }
    } catch (error) {
      console.error("Failed to load heatmap", error);
    }
    setHeatmapLoading(false);
  };

  const handleExpandUser = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    
    if (!userRemotes[userId]) {
      const res = await fetchData(`${presence_server}/api/admin/inspect?userId=${userId}`, token);
      if (res.data?.data?.remotes) {
        setUserRemotes(prev => ({ ...prev, [userId]: res.data.data.remotes }));
      }
    }
  };

  const handleLeaderboardClick = (user) => {
      setSearch(user.displayName); // Note: user.displayName is used here for searching visually
      if (expandedUser !== user.id) {
          handleExpandUser(user.id);
      }
      setTimeout(() => {
          document.getElementById('customer-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
  };

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter(u => u.displayName.toLowerCase().includes(q))
      .filter(u => roleFilter === "all" || getUserRole(u) === roleFilter);
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [search, roleFilter]);

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Customer Insights</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor user engagement, device health, and activity patterns.</p>
      </div>

      {/* Row 1: Charts & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Activity Line Chart */}
        <Card className="p-5 flex flex-col">
          <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#195C51]" />
              <h2 className="font-display font-semibold text-lg">Activity Trend</h2>
            </div>
            <TimeWindowPicker value={activityWin} onChange={setActivityWin} />
          </div>
          <div className="h-[250px] w-full flex items-center justify-center bg-slate-50/50 rounded-lg border border-slate-100">
            {trendsLoading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                 <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-sm font-medium">Loading trends...</span>
              </div>
            ) : (() => {
              const data = fleetActivity.length > 0 ? fleetActivity : (() => {
                const zeroed = [];
                const dayMs = 86400000;
                const spanDays = Math.max(1, Math.ceil((activityRange.to - activityRange.from) / dayMs) + 1);
                for (let i = 0; i < spanDays; i++) {
                  const d = new Date(activityRange.from.getTime() + i * dayMs);
                  if (d > activityRange.to) break;
                  zeroed.push({ date: d.toISOString().split('T')[0], count: 0 });
                }
                return zeroed;
              })();
              return (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} 
                    cursor={{ stroke: '#195C51', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line type="monotone" dataKey="count" name="Interactions" stroke="#195C51" strokeWidth={3} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              );
            })()}
          </div>
        </Card>

        {/* Peak Usage Heatmap */}
        <Card className="p-5 flex flex-col">
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#195C51]" />
              <h2 className="font-display font-semibold text-lg">Peak Usage Heatmap</h2>
            </div>
            <TimeWindowPicker value={heatmapWin} onChange={setHeatmapWin} allowToday={false} />
          </div>

          <div className="flex-1 overflow-x-auto flex items-center justify-center bg-slate-50/50 rounded-lg border border-slate-100 p-4">
            {heatmapLoading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                 <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-sm font-medium">Computing heatmap...</span>
              </div>
            ) : fleetHeatmap.length > 0 ? (
              <div className="min-w-[400px] w-full">
                {/* X-Axis (Hours) */}
                <div className="flex ml-8 mb-1.5">
                  {Array.from({ length: 24 }).map((_, h) => (
                    <div key={h} className="flex-1 text-center font-bold text-slate-400" style={{ fontSize: '9px' }}>
                      {h % 4 === 0 ? `${h}h` : ''}
                    </div>
                  ))}
                </div>

                {/* Y-Axis (Days) + Grid */}
                <div className="space-y-1">
                  {fleetHeatmap.map((row, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-6 text-[10px] font-bold text-slate-500 shrink-0 text-right pr-1">{row.day.slice(0, 3)}</div>
                      <div className="flex flex-1 gap-0.5">
                        {row.hours.map((val, j) => {
                          const opacity = val === 0 ? 0 : Math.max(0.15, val / maxHeatmapVal);
                          return (
                            <div 
                              key={j} 
                              className="flex-1 aspect-[3/4] rounded-sm cursor-pointer hover:ring-1 hover:ring-slate-900 transition-all relative group"
                              style={{ backgroundColor: val === 0 ? '#f1f5f9' : `rgba(25, 92, 81, ${opacity})` }}
                            >
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 w-max bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none">
                                  {row.day}, {j}:00 - {val} opens
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Heatmap Legend */}
                <div className="flex items-center justify-end gap-2 mt-4">
                  <span className="text-[10px] text-slate-500 font-medium">Less</span>
                  <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(25, 92, 81, 0.2)' }}></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(25, 92, 81, 0.5)' }}></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(25, 92, 81, 0.8)' }}></div>
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(25, 92, 81, 1)' }}></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">More</span>
                </div>

              </div>
            ) : (
              <p className="text-sm text-slate-400 font-medium">No heatmap data available yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Row 2: Leaderboard & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaderboard */}
        <Card className="lg:col-span-2 p-5 flex flex-col">
          <div className="flex flex-col gap-4 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-semibold text-lg">Most Engaged Customers</h2>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                Ranked by active days
              </span>
            </div>

            {/* Time selector */}
            <TimeWindowPicker value={leaderboardWin} onChange={setLeaderboardWin} />
          </div>

          <div className="space-y-3">
            {leaderboardLoading ? (
              <p className="text-sm text-slate-500 text-center py-4 animate-pulse">Syncing rankings...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No activity in this period.</p>
            ) : (
              leaderboard.map((user, idx) => {
                const meta = ROLE_META[user.role] || ROLE_META.none;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleLeaderboardClick(user)}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0
                        ${idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          idx === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                          idx === 2 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-slate-50 text-slate-500 border border-slate-100'}`}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PrivacyNameToggle fullName={user.displayName} />
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${meta.classes}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <p className="text-lg font-bold text-[#195C51] leading-none">{user.activeDays}</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Active days</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{user.totalEvents} interactions</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Alerts Section */}
        <Card className="lg:col-span-1 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="font-display font-semibold text-lg">System Alerts</h2>
            </div>
            <select
              value={alertTime}
              onChange={(e) => setAlertTime(Number(e.target.value))}
              className="text-xs bg-slate-100 border-none rounded-md px-2 py-1 font-medium text-slate-700 outline-none cursor-pointer"
            >
                <option value={1}>Today</option>
                <option value={7}>This Week</option>
                <option value={30}>This Month</option>
                <option value={365}>This Year</option>
            </select>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Users averaging 5+ offline events per day
            {" "}(≥{5 * alertTime} total over {alertTime === 1 ? "today" : `${alertTime} days`}).
          </p>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar max-h-[250px]">
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-4">Checking health...</p>
            ) : alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                  <span className="text-emerald-500">✓</span>
                </div>
                <p className="text-sm font-medium">All systems healthy.</p>
              </div>
            ) : (
              alerts.map(u => (
                <div key={u.id} className="p-3 bg-red-50/50 border border-red-100 rounded-lg flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <PrivacyNameToggle fullName={u.displayName} />
                    <p className="text-[10px] text-red-600 font-medium mt-0.5">{u.devices?.totalOfflineIncidents} offline events</p>
                  </div>
                  <button 
                    onClick={() => handleLeaderboardClick(u)}
                    className="text-[10px] uppercase tracking-wider font-bold text-red-700 hover:underline shrink-0"
                  >
                    Inspect
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Main Users Table */}
      <Card id="customer-directory" className="overflow-hidden scroll-m-24">
        <div className="p-5 border-b border-slate-200 flex flex-col gap-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Customer Directory</h2>
              <p className="text-xs text-slate-500 mt-1">
                Showing {users.length} {users.length === 1 ? "account" : "accounts"} — owners, shared users, and app-only signups.
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 w-full sm:w-72 transition-all"
              />
            </div>
          </div>

          {/* Role filter pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all",    label: "All" },
              { id: "owner",  label: "Owners" },
              { id: "shared", label: "Shared" },
              { id: "none",   label: "No device" },
            ].map((t) => {
              const count =
                t.id === "all"
                  ? users.length
                  : users.filter((u) => getUserRole(u) === t.id).length;
              const active = roleFilter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setRoleFilter(t.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? "bg-[#195C51] text-white border-[#195C51] shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {t.label}
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Customer Name</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Hardware</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading customers...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No customers found.</td></tr>
              ) : pagedUsers.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No customers match these filters.</td></tr>
              ) : pagedUsers.map(user => (
                <React.Fragment key={user.id}>
                  {/* Main User Row */}
                  <tr 
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedUser === user.id ? 'bg-slate-50/80' : ''}`} 
                    onClick={() => handleExpandUser(user.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-md transition-colors ${expandedUser === user.id ? 'bg-[#195C51]/10 text-[#195C51]' : 'text-slate-400 hover:bg-slate-200'}`}>
                          {expandedUser === user.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <PrivacyNameToggle fullName={user.displayName} />
                            {(() => {
                              const role = getUserRole(user);
                              const meta = ROLE_META[role];
                              return (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${meta.classes}`}>
                                  {meta.label}
                                </span>
                              );
                            })()}
                          </div>
                          <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.hasActiveSubscription ? (
                        <Badge variant="success">Active Plan</Badge>
                      ) : (
                        <Badge variant="warning">Free / Trial</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{user.country || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {(() => {
                        const owned = user.devices?.owned || 0;
                        const received = user.sharing?.sharesReceived || 0;
                        if (owned > 0) {
                          return (
                            <>
                              <span className="text-[#195C51] font-bold">{owned}</span> Owned
                              {received > 0 && (
                                <span className="ml-2 text-xs text-sky-700">
                                  +<span className="font-bold">{received}</span> shared
                                </span>
                              )}
                            </>
                          );
                        }
                        if (received > 0) {
                          return (
                            <>
                              <span className="text-sky-700 font-bold">{received}</span> Shared
                            </>
                          );
                        }
                        return <span className="text-slate-400">—</span>;
                      })()}
                    </td>
                  </tr>

                  {/* Expanded Remotes Sub-rows */}
                  {expandedUser === user.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan="4" className="p-0 border-b border-slate-200">
                        <div className="px-6 md:px-14 py-6 space-y-4 shadow-inner">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Owned Devices</h4>
                          
                          {userRemotes[user.id] ? (
                            userRemotes[user.id].length === 0 ? (
                              <p className="text-sm text-slate-500">
                                {getUserRole(user) === "shared"
                                  ? "This user doesn't own any remotes — they only access shared ones."
                                  : getUserRole(user) === "none"
                                    ? "This account has no owned or shared remotes yet."
                                    : "No remote data found."}
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {userRemotes[user.id].map(remoteObj => {
                                  const r = remoteObj.remote;
                                  const isOnline = remoteObj.connectivity.isOnline;
                                  return (
                                    <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-[#195C51]/30 transition-colors gap-4">
                                      
                                      <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOnline ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-display font-bold text-slate-900 text-base truncate">{r.labelName || 'Unnamed Remote'}</p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-slate-500 font-mono">{r.serialNumber}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{r.modelType}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/dashboard/presence-eye-buttons/remote/${r.serialNumber}`);
                                        }}
                                        className="shrink-0 bg-white border-2 border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all w-full sm:w-auto text-center"
                                      >
                                        Usage History
                                      </button>

                                    </div>
                                  );
                                })}
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-[#195C51] font-medium">
                              <div className="w-4 h-4 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin"></div>
                              Fetching hardware data...
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {!loading && filteredUsers.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{(safePage - 1) * PAGE_SIZE + 1}</span>
              –<span className="font-semibold text-slate-700">{Math.min(safePage * PAGE_SIZE, filteredUsers.length)}</span>
              {" "}of <span className="font-semibold text-slate-700">{filteredUsers.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-slate-600 font-medium px-2">
                Page <span className="font-bold text-slate-900">{safePage}</span> of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}