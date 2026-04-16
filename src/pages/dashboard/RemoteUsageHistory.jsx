// src/pages/dashboard/RemoteUsageHistory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Wifi, WifiOff, Users, Activity,
  Clock, Key, Fingerprint, AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import { fetchData, returnToken } from '../../utils/helper.js';
import { presence_server } from '../../config/server_api.js';

// ─── UI primitives ────────────────────────────────────────────────────────────

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    success:     'bg-emerald-100 text-emerald-800 border-emerald-200',
    destructive: 'bg-red-100    text-red-800    border-red-200',
    warning:     'bg-amber-100  text-amber-800  border-amber-200',
    default:     'bg-slate-100  text-slate-600  border-slate-200',
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0s';
  if (seconds < 60) return '<1m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ');
};

/**
 * FIX #3 — Build a local-timezone date string (YYYY-MM-DD) so that
 * toISOString() UTC offset doesn't silently shift the date by one day
 * for admins in UTC+ timezones.
 */
const toLocalDateStr = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RemoteUsageHistory() {
  const { serialNumber } = useParams();
  const navigate        = useNavigate();
  const token           = returnToken();

  const [loading,    setLoading]    = useState(true);
  const [data,       setData]       = useState(null);
  const [timeFilter, setTimeFilter] = useState('thisMonth');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');

  // Future-date guard for custom-range inputs
  const todayStr = toLocalDateStr(new Date());

  /**
   * FIX #2 — Wrap loadRemoteData in useCallback so every useEffect always
   * calls the latest version of the function (no stale-closure risk on
   * timeFilter / customFrom / customTo).
   */
  const loadRemoteData = useCallback(async () => {
    setLoading(true);

    const now = new Date();
    let toDate   = now;
    let fromDate = now;

    if (timeFilter === 'today') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      toDate   = now;
    } else if (timeFilter === 'yesterday') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      toDate   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    } else if (timeFilter === 'thisMonth') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate   = now;
    } else if (timeFilter === 'thisYear') {
      fromDate = new Date(now.getFullYear(), 0, 1);
      toDate   = now;
    } else if (timeFilter === 'custom') {
      fromDate = new Date(customFrom);
      toDate   = new Date(customTo);
      // Defensive: if someone hand-edits the input past today, clamp the backend query.
      if (toDate > now) toDate = now;
    }

    // FIX #3 — Use local-timezone date strings, not UTC-shifted ISO strings.
    const fromStr = toLocalDateStr(fromDate);
    const toStr   = toLocalDateStr(toDate) + 'T23:59:59';

    try {
      const res = await fetchData(
        `${presence_server}/api/admin/inspect?serialNumber=${serialNumber}&from=${fromStr}&to=${toStr}`,
        token,
      );
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch remote data', err);
    }

    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter, customFrom, customTo, serialNumber, token]);

  // Fetch whenever the preset filter or serial number changes (non-custom).
  useEffect(() => {
    if (timeFilter !== 'custom') {
      loadRemoteData();
    }
  }, [timeFilter, serialNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch for custom range only once both dates are filled and valid.
  useEffect(() => {
    if (timeFilter === 'custom' && customFrom && customTo) {
      if (new Date(customFrom) <= new Date(customTo)) {
        loadRemoteData();
      }
    }
  }, [loadRemoteData]); // loadRemoteData already captures customFrom/customTo

  // ── Early returns ──────────────────────────────────────────────────────────

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 font-sans gap-4">
        <div className="w-8 h-8 border-4 border-[#195C51] border-t-transparent rounded-full animate-spin" />
        <p className="font-medium animate-pulse">
          Running full diagnostic scan on {serialNumber}…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 flex flex-col items-center text-center font-sans gap-4">
        {/* FIX — AlertTriangle was used but never imported in the original */}
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Remote not found.</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-[#195C51] hover:underline font-medium"
        >
          Go back to directory
        </button>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const { remote, connectivity, usage, sharing, owner, timeScope } = data;

  // Chart: aggregate all users' counts per day → single bar per day.
  const engagementChartData = Object.entries(usage.dailyEventsByUser || {})
    .map(([date, usersArray]) => ({
      date:  date.slice(5), // MM-DD display
      opens: usersArray.reduce((sum, u) => sum + u.count, 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // FIX #1 — Filter windows client-side using timeScope returned by the
  // server so the timeline is scoped to exactly the requested period.
  const scopeFrom = new Date(timeScope.from);
  const scopeTo   = new Date(timeScope.to);

  const filteredWindows = (connectivity.windows || []).filter((w) => {
    const start = new Date(w.onlineAt);
    const end   = w.offlineAt ? new Date(w.offlineAt) : new Date();
    return start <= scopeTo && end >= scopeFrom;
  });

  // FIX #1 — Derive the WiFi-outage count from the filtered windows so the
  // KPI card is always consistent with the timeline list below it, instead
  // of using the server-computed all-time offlineIncidents.count.
  const outageCountInRange = filteredWindows.filter((w) => w.offlineAt).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10 max-w-7xl mx-auto animate-slide-up">

      {/* ── Header & time filter ─────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">

        {/* Left: device info */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-3xl font-bold tracking-tight">
                {remote.labelName || 'Unnamed Remote'}
              </h1>
              <Badge variant={connectivity.isOnline ? 'success' : 'destructive'}>
                {connectivity.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
                {serialNumber}
              </span>
              <span>•</span>
              <span className="uppercase tracking-widest font-bold text-[10px]">
                {remote.modelType}
              </span>
              {owner && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> {owner.displayName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: time-filter controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg">
            {[
              { id: 'today',     label: 'Today'      },
              { id: 'yesterday', label: 'Yesterday'  },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'thisYear',  label: 'This Year'  },
              { id: 'custom',    label: 'Custom'     },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                  timeFilter === f.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2 text-sm">
              <input
                type="date"
                value={customFrom}
                max={customTo || todayStr}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-[#195C51] text-xs font-medium"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customTo}
                min={customFrom || undefined}
                max={todayStr}
                onChange={(e) => setCustomTo(e.target.value)}
                className="border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-[#195C51] text-xs font-medium"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Loading overlay (keeps previous data visible while refreshing) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
          <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Fetching date range data…</p>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Gate Interactions */}
            <Card className="p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                  Gate Interactions
                </p>
                <p className="text-3xl font-bold font-display text-blue-600">
                  {usage.totalEventsInRange || 0}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Total opens / closes in period
              </p>
            </Card>

            {/* Time Online */}
            <Card className="p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                  Time Online
                </p>
                <p className="text-3xl font-bold font-display text-emerald-600">
                  {connectivity.rangeUptime}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Of selected period ({connectivity.rangeUptimePct})
              </p>
            </Card>

            {/* WiFi Outages — FIX #1: use filteredWindows-derived count */}
            <Card className="p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-16 h-16 bg-red-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                  WiFi Outages
                </p>
                <p className="text-3xl font-bold font-display text-red-500">
                  {outageCountInRange}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Avg duration: {connectivity.offlineIncidents?.avgDuration || '0s'}
              </p>
            </Card>

            {/* Shared Users — FIX #4: clearly split live count vs period count */}
            <Card className="p-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-16 h-16 bg-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                  Shared Users
                </p>
                {/* Primary figure: shares created within the selected period */}
                <p className="text-3xl font-bold font-display text-purple-600">
                  {sharing.sharesInRange ?? 0}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                New shares in period &nbsp;·&nbsp;{sharing.activeShares ?? 0} active total
              </p>
            </Card>

          </div>

          {/* ── Engagement Chart + User Interactions ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Bar chart: daily gate opens */}
            <Card className="flex flex-col h-[380px]">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#195C51]" /> Daily Engagement
                </h2>
                <Badge variant="default">{usage.totalEventsInRange} Opens</Badge>
              </div>

              <div className="p-5 flex-1 w-full">
                {engagementChartData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Activity className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No gate opens recorded in this period.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    {/* FIX — CartesianGrid is now imported */}
                    <BarChart
                      data={engagementChartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        allowDecimals={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                        cursor={{ fill: 'rgba(25, 92, 81, 0.05)' }}
                      />
                      <Bar dataKey="opens" name="Gate Opens" fill="#195C51" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            {/* Who opened the gate — per-user breakdown */}
            <Card className="flex flex-col h-[380px]">
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-[#195C51]" /> Who Opened The Gate?
                </h2>
              </div>

              <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                {!usage.userInteractions?.length ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Users className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No interaction data for this period.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {usage.userInteractions.map((u, i) => {
                      const pct = usage.totalEventsInRange > 0
                        ? Math.min((u.eventCount / usage.totalEventsInRange) * 100, 100)
                        : 0;
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between items-end">
                            <span className="text-sm font-semibold text-slate-800">
                              {u.displayName}
                            </span>
                            <span className="text-xs font-bold text-[#195C51]">
                              {u.eventCount} opens
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#195C51] rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* ── WiFi Connection History timeline ───────────────────────────── */}
          <Card className="flex flex-col h-[400px]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#195C51]" /> WiFi Connection History
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Logs showing when the device connected or disconnected from the internet
                  within the selected period.
                </p>
              </div>
              {/* FIX #1 — count comes from filteredWindows, consistent with the list */}
              <Badge variant="default">{filteredWindows.length} Logs</Badge>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {filteredWindows.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <WifiOff className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm text-center font-medium">
                    No WiFi events logged in this timeframe.
                  </p>
                  <p className="text-xs text-center mt-1">
                    If the device is online, the connection has been stable throughout.
                  </p>
                </div>
              ) : (
                <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-slate-200">
                  {filteredWindows.slice().reverse().map((win, idx) => (
                    <div key={idx} className="relative pl-8 py-3 group">

                      {/* Timeline node */}
                      <div
                        className={`absolute left-0 top-5 w-6 h-6 rounded-full flex items-center justify-center shadow-sm border-2 border-white z-10 ${
                          win.isOpen ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />

                      {/* Content card */}
                      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-sm transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        {/* Connected */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Wifi className={`w-4 h-4 ${win.isOpen ? 'text-emerald-500' : 'text-slate-400'}`} />
                            <p className="text-sm font-bold text-slate-800">Connection Established</p>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">
                            {formatDate(win.onlineAt)}
                          </p>
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-slate-200" />

                        {/* Disconnected / still active */}
                        <div className="text-left sm:text-right">
                          {win.offlineAt ? (
                            <>
                              <div className="flex items-center sm:justify-end gap-2 mb-1">
                                <WifiOff className="w-4 h-4 text-red-400" />
                                <p className="text-sm font-bold text-slate-800">Connection Lost</p>
                              </div>
                              <p className="text-xs text-slate-500 font-mono">
                                {formatDate(win.offlineAt)}
                              </p>
                            </>
                          ) : (
                            <div className="flex items-center sm:justify-end h-full">
                              <Badge variant="success">Currently Active</Badge>
                            </div>
                          )}
                        </div>

                        <div className="hidden md:block w-px h-8 bg-slate-200" />

                        {/* Duration */}
                        <div className="text-left sm:text-right w-24 shrink-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                            Duration
                          </p>
                          <p className="text-sm font-bold text-[#195C51]">
                            {formatDuration(win.durationSeconds)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}