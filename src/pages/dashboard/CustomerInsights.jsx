// src/pages/dashboard/CustomerInsights.jsx
import React, { useState, useEffect } from 'react';
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
  
  // Charts & Heatmap States
  const [fleetActivity, setFleetActivity] = useState([]);
  const [fleetHeatmap, setFleetHeatmap] = useState([]);
  const [maxHeatmapVal, setMaxHeatmapVal] = useState(1);
  
  // Table state
  const [expandedUser, setExpandedUser] = useState(null);
  const [userRemotes, setUserRemotes] = useState({});
  const [search, setSearch] = useState("");

  // Filters State
  const [activityTime, setActivityTime] = useState(7); // 1, 7, 30, 365
  const [alertTime, setAlertTime] = useState(1); // 1, 7, 30
  const [leaderboardTime, setLeaderboardTime] = useState("month");

  useEffect(() => {
    loadBaseUsersAndAlerts();
  }, [alertTime, leaderboardTime]); 

  useEffect(() => {
    loadFleetTrends();
  }, [activityTime]);

  const loadBaseUsersAndAlerts = async () => {
    setLoading(true);
    try {
      const usersRes = await fetchData(`${presence_server}/api/admin/analytics-users?hasRemotes=true&limit=100&sortBy=totalEvents&order=desc`, token);
      
      if (usersRes.data?.users) {
        const validUsers = usersRes.data.users.filter(u => !EXCLUDED_TESTER_EMAILS.includes(u.email?.toLowerCase()));
        setUsers(validUsers);

        const fromDate = new Date(Date.now() - alertTime * 86400000).toISOString().split('T')[0];
        const alertsRes = await fetchData(`${presence_server}/api/admin/analytics-users?offlineIncidentsMin=10&from=${fromDate}&limit=10`, token);
        
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

  const loadFleetTrends = async () => {
    setTrendsLoading(true);
    try {
      const trendsRes = await fetchData(`${presence_server}/api/admin/analytics-users/fleet-trends?days=${activityTime}`, token);
      if (trendsRes.data?.data) {
         setFleetActivity(trendsRes.data.data.activityTrend || []);
         setFleetHeatmap(trendsRes.data.data.heatmap || []);
         setMaxHeatmapVal(trendsRes.data.data.maxHeatmapValue || 1);
      }
    } catch (error) {
      console.error("Failed to load trends", error);
    }
    setTrendsLoading(false);
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

  const topUsers = users.slice(0, 5);

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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#195C51]" />
              <h2 className="font-display font-semibold text-lg">Activity Trend</h2>
            </div>
            <select 
              value={activityTime} 
              onChange={(e) => setActivityTime(Number(e.target.value))}
              className="text-xs bg-slate-100 border-none rounded-md px-2 py-1 font-medium text-slate-700 outline-none cursor-pointer"
            >
                <option value={1}>Today</option>
                <option value={7}>This Week</option>
                <option value={30}>This Month</option>
                <option value={365}>This Year</option>
            </select>
          </div>
          <div className="h-[250px] w-full flex items-center justify-center bg-slate-50/50 rounded-lg border border-slate-100">
            {trendsLoading ? (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                 <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-sm font-medium">Loading trends...</span>
              </div>
            ) : fleetActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fleetActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            ) : (
              <p className="text-sm text-slate-400 font-medium">No activity data available for this period.</p>
            )}
          </div>
        </Card>

        {/* Peak Usage Heatmap */}
        <Card className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#195C51]" />
              <h2 className="font-display font-semibold text-lg">Peak Usage Heatmap</h2>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Global Fleet ({activityTime} days)</span>
          </div>
          
          <div className="flex-1 overflow-x-auto flex items-center justify-center bg-slate-50/50 rounded-lg border border-slate-100 p-4">
            {trendsLoading ? (
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="font-display font-semibold text-lg">Top Customers</h2>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' }
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setLeaderboardTime(t.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${leaderboardTime === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500 text-center py-4 animate-pulse">Syncing rankings...</p>
            ) : topUsers.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No interaction data available.</p>
            ) : (
              topUsers.map((user, idx) => (
                <div 
                  key={user.id} 
                  onClick={() => handleLeaderboardClick(user)}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm
                      ${idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                        idx === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' : 
                        idx === 2 ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                        'bg-slate-50 text-slate-500 border border-slate-100'}`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <PrivacyNameToggle fullName={user.displayName} />
                      <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#195C51]">{user.devices?.totalEvents || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Interactions</p>
                  </div>
                </div>
              ))
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
            </select>
          </div>
          <p className="text-xs text-slate-500 mb-4">Users with 10+ offline incidents.</p>
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
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="font-display font-semibold text-lg">Customer Directory</h2>
            <p className="text-xs text-slate-500 mt-1">Showing {users.length} active hardware owners.</p>
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
              ) : users.filter(u => u.displayName.toLowerCase().includes(search.toLowerCase())).map(user => (
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
                        <div>
                          <PrivacyNameToggle fullName={user.displayName} />
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
                      <span className="text-[#195C51] font-bold">{user.devices?.owned || 0}</span> Remotes
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
                              <p className="text-sm text-slate-500">No remote data found.</p>
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
      </Card>
    </div>
  );
}