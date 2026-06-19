// src/pages/dashboard/CustomerInsights.jsx
//
// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
//
// Single-page analytics dashboard for admin-level customer insights.
//
// Key design decisions (revised):
//
//   1. UNIFIED ROLE SCOPE — a single `roles` selector in the page header
//      controls which user cohort is reflected in every metric: KPI cards,
//      fleet graphs, heatmap, and engagement leaderboard.  The old separate
//      `statsRoles` param has been removed.
//
//   2. SHARED TIME WINDOW — one TimeWindowPicker drives the `from` / `to`
//      window sent to the analytics endpoint.  All four data sets (stats,
//      trends, heatmap, leaderboard) respect it; only the paginated table
//      omits it (it shows all-time records, filtered server-side via its own
//      device / subscription filters).
//
//   3. NO SEPARATE REPORT ENDPOINT — report generation reuses the active
//      /api/admin/analytics-users endpoint and assembles the PDF client-side
//      from the data already in state.
//
//   4. COMPLETE STATS DISPLAY — all sharing and subscription properties
//      returned by the backend are now surfaced in the UI.
//
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  ChevronDown, Activity, AlertTriangle, Trophy,
  Search, CalendarDays, FileText, Printer, Download, X, Wifi,
  WifiOff, Users, Shield, Star, ChevronUp, ChevronsUpDown,
  Filter, SlidersHorizontal, RotateCcw, Globe, BadgeCheck,
  BadgeX, Zap, Share2, TrendingUp, TrendingDown, Clock, Eye,
  CheckCircle2, XCircle, AlertCircle, Minus, ArrowUpRight,
  BarChart2, Settings2, RefreshCw, ChevronLast, ChevronFirst,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { fetchData, returnToken } from '../../utils/helper.js';
import { presence_server } from '../../config/server_api.js';
import { PrivacyNameToggle } from './DeviceInsights.jsx';
import { maskEmail } from '../../components/PrivacyMask.jsx';
import UserInspectModal from './UserInspectModal.jsx';

// ─── Constants ────────────────────────────────────────────────────────────────

const EXCLUDED_TESTER_EMAILS = [];

const SORT_OPTIONS = [
  { value: 'createdAt',          label: 'Member Since',       group: 'native'   },
  { value: 'updatedAt',          label: 'Last Updated',       group: 'native'   },
  { value: 'firstName',          label: 'Name (A–Z)',         group: 'native'   },
  { value: 'status',             label: 'Account Status',     group: 'native'   },
  { value: 'country',            label: 'Country',            group: 'native'   },
  { value: 'totalEvents',        label: 'Total Events',       group: 'computed' },
  { value: 'lastActivity',       label: 'Last Activity',      group: 'computed' },
  { value: 'totalUptime',        label: 'Total Uptime',       group: 'computed' },
  { value: 'offlineIncidents',   label: 'Offline Incidents',  group: 'computed' },
  { value: 'remoteCount',        label: 'Remote Count',       group: 'computed' },
  { value: 'sharesGiven',        label: 'Shares Given',       group: 'computed' },
  { value: 'avgEventsPerRemote', label: 'Avg Events/Remote',  group: 'computed' },
];

const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: '',             label: 'Any status'       },
  { value: 'active',       label: '🟢 Active'         },
  { value: 'trial',        label: '🔵 Trial'           },
  { value: 'grace_period', label: '🟡 Grace Period'   },
  { value: 'expired',      label: '🔴 Expired'         },
  { value: 'cancelled',    label: '⚫ Cancelled'       },
  { value: 'pending',      label: '🟡 Pending'         },
  { value: 'failed',       label: '🔴 Payment Failed'  },
  { value: 'none',         label: 'No subscription'   },
  { value: 'any',          label: 'Has subscription'  },
];

const DEVICE_ONLINE_STATUS_OPTIONS = [
  { value: '',           label: 'Any connectivity'          },
  { value: 'allOnline',  label: '✅ All remotes online'     },
  { value: 'someOnline', label: '🔶 At least one online'    },
  { value: 'mixed',      label: '🔀 Mixed (partial issues)' },
  { value: 'allOffline', label: '❌ All remotes offline'    },
  { value: 'noneEver',   label: '⭕ Never connected'         },
];

const ROLE_OPTIONS = [
  { value: '',             label: 'All roles'      },
  { value: 'user,special', label: 'Customers only' },
  { value: 'user',         label: 'Regular users'  },
  { value: 'special',      label: 'Special users'  },
  { value: 'admin',        label: 'Admins only'    },
];

const ACCOUNT_STATUS_OPTIONS = [
  { value: '',            label: 'Any status'  },
  { value: 'active',      label: 'Active'      },
  { value: 'deactivated', label: 'Deactivated' },
];

const filterSelectClass = 'w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 outline-none cursor-pointer hover:border-slate-300 focus:border-[#195C51]';
const filterInputClass  = 'w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-[#195C51]';

const FILTER_LABELS = {
  status: 'Status', country: 'Country', roles: 'Role',
  subscriptionStatus: 'Subscription', deviceOnlineStatus: 'Connectivity',
  hasRemotes: 'Has Remotes', offlineIncidentsMin: 'Incidents ≥',
  offlineIncidentsMax: 'Incidents ≤', currentOfflineMinHours: 'Offline ≥ hrs',
};

// ─── Time-window helpers ──────────────────────────────────────────────────────

const todayISO     = () => new Date().toISOString().split('T')[0];
const thisMonthISO = () => todayISO().slice(0, 7);
const thisYearNum  = () => new Date().getFullYear();

const startOfDay = (d) => { const x = new Date(d); x.setHours(0,  0,  0,   0); return x; };
const endOfDay   = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const clampTo    = (d) => { const now = new Date(); return d > now ? now : d; };

const resolveWindow = (state) => {
  const now = new Date();
  switch (state.mode) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now), label: 'Today' };
    case 'day': {
      const d = new Date(state.day);
      return { from: startOfDay(d), to: clampTo(endOfDay(d)), label: state.day };
    }
    case 'thisWeek': {
      const dow   = (now.getDay() + 6) % 7;
      const start = startOfDay(new Date(now.getTime() - dow * 86_400_000));
      return { from: start, to: endOfDay(now), label: 'This week' };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: start, to: endOfDay(now), label: 'This month' };
    }
    case 'month': {
      const [y, m] = state.month.split('-').map(Number);
      const start  = new Date(y, m - 1, 1);
      const end    = new Date(y, m, 0, 23, 59, 59, 999);
      return { from: start, to: clampTo(end), label: state.month };
    }
    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1);
      return { from: start, to: endOfDay(now), label: 'This year' };
    }
    case 'year': {
      const y = Number(state.year);
      return { from: new Date(y, 0, 1), to: clampTo(new Date(y, 11, 31, 23, 59, 59, 999)), label: state.year };
    }
    case 'custom': {
      const f = startOfDay(new Date(state.range.from));
      const t = clampTo(endOfDay(new Date(state.range.to)));
      return { from: f, to: t, label: `${state.range.from} → ${state.range.to}` };
    }
    default:
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now), label: 'This month' };
  }
};

const defaultTimeWindow = (mode = 'thisMonth') => ({
  mode,
  day:   todayISO(),
  month: thisMonthISO(),
  year:  String(thisYearNum()),
  range: { from: todayISO(), to: todayISO() },
});

const YEAR_OPTIONS = (() => {
  const y   = thisYearNum();
  const out = [];
  for (let i = y; i >= 2020; i--) out.push(String(i));
  return out;
})();

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const Card = ({ children, className = '', id }) => (
  <div id={id} className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default:     'bg-slate-100 text-slate-800 border-slate-200',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    success:     'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning:     'bg-amber-100 text-amber-800 border-amber-200',
    info:        'bg-blue-100 text-blue-800 border-blue-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${variants[variant]}`}>
      {children}
    </span>
  );
};

const subscriptionVariant = (status) => ({
  active: 'success', trial: 'info', grace_period: 'warning',
  expired: 'destructive', cancelled: 'default', pending: 'warning',
  failed: 'destructive',
}[status] || 'default');

const subscriptionLabel = (status) => ({
  active: 'Active', trial: 'Trial', grace_period: 'Grace Period',
  expired: 'Expired', cancelled: 'Cancelled', pending: 'Pending',
  failed: 'Failed', none: 'No Plan',
}[status] || status);

// ─── TimeWindowPicker ─────────────────────────────────────────────────────────

const TimeWindowPicker = ({ value, onChange, allowToday = true }) => {
  const set   = (patch) => onChange({ ...value, ...patch });
  const modes = [
    allowToday && { id: 'today',     label: 'Today'       },
    allowToday && { id: 'day',       label: 'Any day…'    },
    { id: 'thisWeek',  label: 'This week'  },
    { id: 'thisMonth', label: 'This month' },
    { id: 'month',     label: 'Any month…' },
    { id: 'thisYear',  label: 'This year'  },
    { id: 'year',      label: 'Any year…'  },
    { id: 'custom',    label: 'Custom…'    },
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={value.mode} onChange={(e) => set({ mode: e.target.value })}
        className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none cursor-pointer hover:border-slate-300">
        {modes.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
      </select>
      {value.mode === 'day' && (
        <input type="date" value={value.day} max={todayISO()} onChange={(e) => set({ day: e.target.value })}
          className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none hover:border-slate-300" />
      )}
      {value.mode === 'month' && (
        <input type="month" value={value.month} max={thisMonthISO()} onChange={(e) => set({ month: e.target.value })}
          className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none hover:border-slate-300" />
      )}
      {value.mode === 'year' && (
        <select value={value.year} onChange={(e) => set({ year: e.target.value })}
          className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none cursor-pointer hover:border-slate-300">
          {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      )}
      {value.mode === 'custom' && (
        <div className="flex items-center gap-1.5">
          <input type="date" value={value.range.from} max={value.range.to}
            onChange={(e) => set({ range: { ...value.range, from: e.target.value } })}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none hover:border-slate-300" />
          <span className="text-slate-400 text-xs">→</span>
          <input type="date" value={value.range.to} min={value.range.from} max={todayISO()}
            onChange={(e) => set({ range: { ...value.range, to: e.target.value } })}
            className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-medium text-slate-700 outline-none hover:border-slate-300" />
        </div>
      )}
    </div>
  );
};

// ─── KPI Stat Card ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon, accent = 'slate', onClick, active, badge }) => {
  const accents = {
    slate:  { bg: 'bg-slate-50',   border: 'border-slate-200',   icon: 'text-slate-500',   val: 'text-slate-900',   activeBg: 'bg-slate-100',   activeBorder: 'border-slate-400'   },
    green:  { bg: 'bg-emerald-50', border: 'border-slate-200',   icon: 'text-emerald-600', val: 'text-emerald-700', activeBg: 'bg-emerald-100', activeBorder: 'border-emerald-400' },
    red:    { bg: 'bg-red-50',     border: 'border-slate-200',   icon: 'text-red-500',     val: 'text-red-600',     activeBg: 'bg-red-100',     activeBorder: 'border-red-400'     },
    amber:  { bg: 'bg-amber-50',   border: 'border-slate-200',   icon: 'text-amber-600',   val: 'text-amber-700',   activeBg: 'bg-amber-100',   activeBorder: 'border-amber-400'   },
    blue:   { bg: 'bg-blue-50',    border: 'border-slate-200',   icon: 'text-blue-600',    val: 'text-blue-700',    activeBg: 'bg-blue-100',    activeBorder: 'border-blue-400'    },
    purple: { bg: 'bg-purple-50',  border: 'border-slate-200',   icon: 'text-purple-600',  val: 'text-purple-700',  activeBg: 'bg-purple-100',  activeBorder: 'border-purple-400'  },
    teal:   { bg: 'bg-teal-50',    border: 'border-slate-200',   icon: 'text-[#195C51]',   val: 'text-[#195C51]',   activeBg: 'bg-[#195C51]/10',activeBorder: 'border-[#195C51]'   },
    orange: { bg: 'bg-orange-50',  border: 'border-slate-200',   icon: 'text-orange-500',  val: 'text-orange-600',  activeBg: 'bg-orange-100',  activeBorder: 'border-orange-400'  },
  };
  const a = accents[accent] || accents.slate;

  return (
    <div
      onClick={onClick}
      className={`relative border rounded-xl p-4 flex flex-col gap-2 transition-all
        ${active ? `${a.activeBg} ${a.activeBorder} ring-1 ring-inset ring-current shadow-sm` : `${a.bg} ${a.border}`}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 group' : ''}`}
    >
      {onClick && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        {Icon && <Icon className={`w-4 h-4 ${a.icon}`} />}
      </div>
      <p className={`text-2xl font-bold font-display leading-none ${a.val}`}>{value ?? '—'}</p>
      {sub && <p className="text-[10px] text-slate-400 font-medium">{sub}</p>}
      {badge && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#195C51] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
};

// ─── Sort Button ──────────────────────────────────────────────────────────────

const SortButton = ({ sortBy, order, field, label, onChange }) => {
  const active = sortBy === field;
  return (
    <button
      onClick={() => onChange(field, active && order === 'desc' ? 'asc' : 'desc')}
      className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors
        ${active ? 'text-[#195C51]' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {label}
      {active
        ? order === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
        : <ChevronsUpDown className="w-3 h-3 opacity-50" />}
    </button>
  );
};

// ─── FilterField ──────────────────────────────────────────────────────────────

const FilterField = ({ label, children }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    {children}
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner = ({ label }) => (
  <div className="flex flex-col items-center gap-2 text-slate-400">
    <div className="w-6 h-6 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

// ─── Zero-fill chart data ─────────────────────────────────────────────────────

const buildZeroedSeries = (range) => {
  const dayMs = 86_400_000;
  const span  = Math.max(1, Math.ceil((range.to - range.from) / dayMs) + 1);
  const out   = [];
  for (let i = 0; i < span; i++) {
    const d = new Date(range.from.getTime() + i * dayMs);
    if (d > range.to) break;
    out.push({ date: d.toISOString().split('T')[0], count: 0 });
  }
  return out;
};

// ─── Heatmap Grid ─────────────────────────────────────────────────────────────

const HeatmapGrid = ({ rows, maxVal }) => (
  <div className="min-w-[400px] w-full">
    <div className="flex ml-8 mb-1.5">
      {Array.from({ length: 24 }).map((_, h) => (
        <div key={h} className="flex-1 text-center font-bold text-slate-400" style={{ fontSize: '9px' }}>
          {h % 4 === 0 ? `${h}h` : ''}
        </div>
      ))}
    </div>
    <div className="space-y-1">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-6 text-[10px] font-bold text-slate-500 shrink-0 text-right pr-1">{row.day.slice(0, 3)}</div>
          <div className="flex flex-1 gap-0.5">
            {row.hours.map((val, j) => {
              const opacity = val === 0 ? 0 : Math.max(0.15, val / maxVal);
              return (
                <div key={j}
                  className="flex-1 aspect-[3/4] rounded-sm cursor-pointer hover:ring-1 hover:ring-slate-900 transition-all relative group"
                  style={{ backgroundColor: val === 0 ? '#f1f5f9' : `rgba(25, 92, 81, ${opacity})` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 w-max bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none">
                    {row.day}, {j}:00 — {val} opens
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-end gap-2 mt-4">
      <span className="text-[10px] text-slate-500 font-medium">Less</span>
      <div className="flex gap-0.5">
        {[0, 0.2, 0.5, 0.8, 1].map(o => (
          <div key={o} className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: o === 0 ? '#f1f5f9' : `rgba(25, 92, 81, ${o})` }} />
        ))}
      </div>
      <span className="text-[10px] text-slate-500 font-medium">More</span>
    </div>
  </div>
);

// ─── Default filter/sort state ────────────────────────────────────────────────

const defaultFilters = () => ({
  search:                '',
  status:                '',
  country:               '',
  roles:                 '',
  subscriptionStatus:    '',
  deviceOnlineStatus:    '',
  hasRemotes:            '',
  offlineIncidentsMin:   '',
  offlineIncidentsMax:   '',
  currentOfflineMinHours:'',
});

// ─── Connectivity detail modal ────────────────────────────────────────────────

const ConnectivityModal = ({ type, globalStats, onClose, onFilterDirectory }) => {
  if (!globalStats?.deviceHealth) return null;
  const dh = globalStats.deviceHealth;

  const configs = {
    allOnline:   { title: 'All Remotes Online',    color: 'green', count: dh.usersAllRemotesOnline,        icon: CheckCircle2, description: 'Users where every owned remote is currently connected.'          },
    mixed:       { title: 'Mixed Connectivity',     color: 'amber', count: dh.usersMixedOnlineOffline,      icon: AlertCircle,  description: 'Users with some remotes online and some offline.'               },
    allOffline:  { title: 'All Remotes Offline',    color: 'red',   count: dh.usersAllRemotesOffline,       icon: XCircle,      description: 'Users where every owned remote is offline.'                     },
    noneEver:    { title: 'Never Connected',         color: 'slate', count: dh.usersRemotesNeverConnected,   icon: Minus,        description: 'Users who own remotes but none has ever connected.'             },
    noDevice:    { title: 'No Devices',              color: 'slate', count: dh.usersWithoutRemotes,          icon: Users,        description: 'Users with no remotes (app-only accounts).'                     },
    withRemotes: { title: 'Have Remotes',            color: 'teal',  count: dh.usersWithRemotes,             icon: Wifi,         description: 'Total users who own at least one remote.'                       },
  };

  const cfg = configs[type];
  if (!cfg) return null;

  const filterMap = {
    allOnline:   { deviceOnlineStatus: 'allOnline',  hasRemotes: 'true' },
    mixed:       { deviceOnlineStatus: 'mixed',      hasRemotes: 'true' },
    allOffline:  { deviceOnlineStatus: 'allOffline', hasRemotes: 'true' },
    noneEver:    { deviceOnlineStatus: 'noneEver',   hasRemotes: 'true' },
    noDevice:    { hasRemotes: 'false' },
    withRemotes: { hasRemotes: 'true'  },
  };

  const colorMap = {
    green: 'text-emerald-600 bg-emerald-50', amber: 'text-amber-600 bg-amber-50',
    red:   'text-red-600 bg-red-50',         slate: 'text-slate-600 bg-slate-50',
    teal:  'text-[#195C51] bg-teal-50',
  };

  const totalAll = (dh.usersWithRemotes || 0) + (dh.usersWithoutRemotes || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[cfg.color]}`}>
            <cfg.icon className="w-6 h-6" />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <h3 className="font-display font-bold text-xl text-slate-900 mb-1">{cfg.title}</h3>
        <p className="text-sm text-slate-500 mb-4">{cfg.description}</p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Affected</p>
          <p className="text-4xl font-bold font-display text-slate-900">{cfg.count ?? '—'}</p>
          {totalAll > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              {((cfg.count / totalAll) * 100).toFixed(1)}% of all users
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">Close</button>
          {filterMap[type] && (
            <button onClick={() => { onFilterDirectory(filterMap[type]); onClose(); }}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#195C51] text-white hover:bg-[#0E3A32] px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
              <Filter className="w-3.5 h-3.5" /> View in Directory
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Subscription detail modal ────────────────────────────────────────────────

const SubscriptionModal = ({ status, globalStats, onClose, onFilterDirectory }) => {
  if (!globalStats?.subscriptionStatusBreakdown) return null;
  const count = globalStats.subscriptionStatusBreakdown[status] || 0;
  const label = subscriptionLabel(status);

  const statusMeta = {
    active:       { icon: CheckCircle2,  color: 'emerald', desc: 'Users with a currently active paid subscription.' },
    trial:        { icon: Zap,           color: 'blue',    desc: 'Users on an active trial.'                        },
    grace_period: { icon: AlertCircle,   color: 'amber',   desc: 'Subscriptions in the grace period.'               },
    expired:      { icon: XCircle,       color: 'red',     desc: 'Subscriptions that have fully expired.'            },
    cancelled:    { icon: XCircle,       color: 'slate',   desc: 'Users who cancelled their subscription.'           },
    pending:      { icon: RefreshCw,     color: 'amber',   desc: 'Subscriptions with payment being processed.'       },
    failed:       { icon: AlertTriangle, color: 'red',     desc: 'Subscriptions with failed payment.'                },
  };

  const meta = statusMeta[status] || { icon: Users, color: 'slate', desc: '' };
  const colorBg = {
    emerald: 'bg-emerald-50 text-emerald-600', blue: 'bg-blue-50 text-blue-600',
    amber:   'bg-amber-50 text-amber-600',     red:  'bg-red-50 text-red-600',
    slate:   'bg-slate-50 text-slate-600',
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorBg[meta.color]}`}>
            <meta.icon className="w-6 h-6" />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <h3 className="font-display font-bold text-xl text-slate-900 mb-1">{label} Subscriptions</h3>
        <p className="text-sm text-slate-500 mb-4">{meta.desc}</p>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Count</p>
          <p className="text-4xl font-bold font-display text-slate-900">{count}</p>
          {globalStats.totalUsers > 0 && (
            <p className="text-xs text-slate-500 mt-1">{((count / globalStats.totalUsers) * 100).toFixed(1)}% of all users</p>
          )}
        </div>
        {globalStats.subscriptionBreakdown?.filter(b => b.status === status).length > 0 && (
          <div className="mb-5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Plan Breakdown</p>
            {globalStats.subscriptionBreakdown.filter(b => b.status === status).map((plan, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <span className="text-xs font-semibold text-slate-800">{plan.planName || 'Unknown Plan'}</span>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#195C51]">{plan.count}</span>
                  {plan.totalRevenue > 0 && <p className="text-[10px] text-slate-400">${plan.totalRevenue.toLocaleString()}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">Close</button>
          <button onClick={() => { onFilterDirectory({ subscriptionStatus: status }); onClose(); }}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#195C51] text-white hover:bg-[#0E3A32] px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
            <Filter className="w-3.5 h-3.5" /> View Users
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Subscription plan bar chart ──────────────────────────────────────────────

const SubscriptionBreakdownChart = ({ data }) => {
  if (!data?.length) return null;
  const chartData = data.map(item => ({
    name:      `${item.planName} (${item.status})`,
    shortName: item.planName || 'Unknown',
    count:     item.count,
    revenue:   item.totalRevenue || 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="shortName" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B' }} angle={-30} textAnchor="end" />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B' }} allowDecimals={false} />
        <RechartsTooltip
          contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px' }}
          formatter={(val, name, props) => [
            `${val} users${props.payload.revenue > 0 ? ` · $${props.payload.revenue.toLocaleString()}` : ''}`,
            'Count',
          ]}
        />
        <Bar dataKey="count" fill="#195C51" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function CustomerInsights() {
  const navigate = useNavigate();
  const token    = returnToken();

  // ── UNIFIED SCOPE: single role selector + single time window ──────────────
  // These two values are sent to every analytics call (stats, trends,
  // heatmap, leaderboard).  The paginated table uses its own device /
  // subscription filters but also inherits `roles`.
  const [roles,      setRoles]      = useState('user,special');
  const [timeWindow, setTimeWindow] = useState(defaultTimeWindow('thisMonth'));
  const timeRange = useMemo(() => resolveWindow(timeWindow), [timeWindow]);

  // ── Table-specific state ──────────────────────────────────────────────────
  const [filters, setFilters] = useState(defaultFilters());
  const [sortBy,  setSortBy]  = useState('createdAt');
  const [order,   setOrder]   = useState('desc');
  const [page,    setPage]    = useState(1);
  const PAGE_SIZE = 20;

  // ── Data ──────────────────────────────────────────────────────────────────
  const [loading,    setLoading]    = useState(true);
  const [globalStats,setGlobalStats]= useState(null);
  const [users,      setUsers]      = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [fleetActivity, setFleetActivity] = useState([]);
  const [fleetHeatmap,  setFleetHeatmap]  = useState([]);
  const [maxHeatmapVal, setMaxHeatmapVal] = useState(1);
  const [leaderboard,   setLeaderboard]   = useState([]);

  const [alerts,     setAlerts]     = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertTime,  setAlertTime]  = useState(7);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [connectivityModal, setConnectivityModal] = useState(null);
  const [subscriptionModal, setSubscriptionModal] = useState(null);
  const [subBreakdownOpen,  setSubBreakdownOpen]  = useState(false);
  const [inspectUserId,     setInspectUserId]     = useState(null);

  // ── Filter panel ──────────────────────────────────────────────────────────
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [pendingFilters,  setPendingFilters]  = useState(defaultFilters());

  // ── Report ────────────────────────────────────────────────────────────────
  const [reportOpen,   setReportOpen]   = useState(false);
  const [reportLoading,setReportLoading]= useState(false);
  const [reportData,   setReportData]   = useState(null);
  const reportRef = useRef(null);

  // ─── Build query string for the unified analytics endpoint ─────────────

  const buildAnalyticsParams = useCallback((extraTable = {}) => {
    const params = new URLSearchParams();

    // Shared scope — roles sent raw to avoid %2C encoding.
    const fromISO = timeRange.from.toISOString();
    const toISO   = timeRange.to.toISOString();
    params.set('from', fromISO);
    params.set('to',   toISO);

    // Table pagination / sort.
    params.set('page',   String(extraTable.page  ?? page));
    params.set('limit',  String(PAGE_SIZE));
    params.set('sortBy', extraTable.sortBy ?? sortBy);
    params.set('order',  extraTable.order  ?? order);

    // Table filters.
    const f = { ...filters, ...extraTable };
    if (f.search)               params.set('search',               f.search);
    if (f.status)               params.set('status',               f.status);
    if (f.country)              params.set('country',              f.country.toUpperCase());
    if (f.subscriptionStatus)   params.set('subscriptionStatus',   f.subscriptionStatus);
    if (f.deviceOnlineStatus)   params.set('deviceOnlineStatus',   f.deviceOnlineStatus);
    if (f.hasRemotes !== '')    params.set('hasRemotes',           f.hasRemotes);
    if (f.offlineIncidentsMin)  params.set('offlineIncidentsMin',  f.offlineIncidentsMin);
    if (f.offlineIncidentsMax)  params.set('offlineIncidentsMax',  f.offlineIncidentsMax);
    if (f.currentOfflineMinHours) params.set('currentOfflineMinHours', f.currentOfflineMinHours);

    // Table role filter (may differ from the global scope selector).
    // When the table's own `roles` filter is set, it takes precedence over the
    // global scope for the user list only.  The backend receives a single `roles`
    // param that drives both the list and the stats.
    const effectiveRoles = f.roles || roles;
    const qs = params.toString();
    return effectiveRoles ? `${qs}&roles=${effectiveRoles}` : qs;
  }, [filters, page, sortBy, order, timeRange, roles]);

  // Active filter count (excludes `search` — shown inline instead).
  const activeFilterCount = useMemo(() => {
    const f = filters;
    return [f.status, f.country, f.roles, f.subscriptionStatus, f.deviceOnlineStatus,
            f.hasRemotes, f.offlineIncidentsMin, f.offlineIncidentsMax, f.currentOfflineMinHours]
      .filter(Boolean).length;
  }, [filters]);

  // Navigate to the directory with a preset filter set.
  const filterDirectory = useCallback((filterPatch) => {
    const fresh = { ...defaultFilters(), ...filterPatch };
    setFilters(fresh);
    setPendingFilters(fresh);
    setPage(1);
    setTimeout(() => {
      document.getElementById('customer-directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, []);

  // ─── Primary data loader ─────────────────────────────────────────────────
  // One request brings back stats + table + trends + leaderboard.

  const loadAll = useCallback(async (tableOverrides = {}) => {
    setLoading(true);
    try {
      const qs  = buildAnalyticsParams(tableOverrides);
      const res = await fetchData(`${presence_server}/api/admin/analytics-users?${qs}`, token);
      if (res.data) {
        const validUsers = (res.data.users || [])
          .filter(u => !EXCLUDED_TESTER_EMAILS.includes(u.email?.toLowerCase()));
        setUsers(validUsers);
        setGlobalStats(res.data.globalStats   || null);
        setPagination(res.data.pagination      || { total: 0, totalPages: 1 });
        setFleetActivity(res.data.fleetTrends?.activityTrend || []);
        setFleetHeatmap(res.data.fleetTrends?.heatmap        || []);
        setMaxHeatmapVal(res.data.fleetTrends?.maxHeatmapValue || 1);
        setLeaderboard(res.data.leaderboard    || []);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
    setLoading(false);
  }, [buildAnalyticsParams, token]);

  // Alerts loader — separate because it has its own time window (alertTime days).
  const loadAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const minIncidents = 5 * alertTime;
      const effectiveRoles = roles ? `&roles=${roles}` : '';
      const res = await fetchData(
        `${presence_server}/api/admin/analytics-users?offlineIncidentsMin=${minIncidents}&limit=10${effectiveRoles}`,
        token,
      );
      if (res.data?.users) {
        setAlerts(res.data.users.filter(u => !EXCLUDED_TESTER_EMAILS.includes(u.email?.toLowerCase())));
      }
    } catch (err) {
      console.error('Failed to load alerts', err);
    }
    setAlertsLoading(false);
  }, [alertTime, roles, token]);

  // ─── Effects ─────────────────────────────────────────────────────────────

  // Reload everything when scope (roles / time window) or table state changes.
  useEffect(() => { loadAll(); },    [filters, sortBy, order, page, roles, timeRange.from, timeRange.to]); // eslint-disable-line
  useEffect(() => { loadAlerts(); }, [alertTime, roles]);                                                   // eslint-disable-line

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleSortChange = (field, dir) => { setSortBy(field); setOrder(dir); setPage(1); };

  const applyFilters = () => {
    setFilters({ ...pendingFilters });
    setPage(1);
    setFilterPanelOpen(false);
  };

  const resetFilters = () => {
    const fresh = defaultFilters();
    setPendingFilters(fresh);
    setFilters(fresh);
    setPage(1);
    setFilterPanelOpen(false);
  };

  // ─── Report generation ────────────────────────────────────────────────────
  // Reuses the active endpoint — no separate /report route needed.

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const qs  = buildAnalyticsParams({ limit: 20 }); // fetch a meaningful snapshot
      const res = await fetchData(`${presence_server}/api/admin/analytics-users?${qs}`, token);
      if (res.data) setReportData(res.data);
    } catch (err) {
      console.error('Report generation failed', err);
    }
    setReportLoading(false);
    setReportOpen(true);
  };

  const downloadPdf = () => {
    if (!reportRef.current) return;
    const label = timeRange.label.replace(/[^\w-]+/g, '_');
    html2pdf().from(reportRef.current).set({
      margin:     [10, 10, 10, 10],
      filename:   `customer-insights-${label}.pdf`,
      image:      { type: 'jpeg', quality: 0.95 },
      html2canvas:{ scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF:      { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:  { mode: ['css', 'legacy'] },
    }).save();
  };

  // ─── Derived ─────────────────────────────────────────────────────────────

  const gs = globalStats;

  const getUserRole = (u) => {
    if ((u.devices?.owned || 0) > 0)          return 'owner';
    if ((u.sharing?.sharesReceived || 0) > 0) return 'shared';
    return 'none';
  };

  const ROLE_META = {
    owner:  { label: 'Owner',     classes: 'bg-[#195C51]/10 text-[#195C51] border-[#195C51]/20' },
    shared: { label: 'Shared',    classes: 'bg-sky-50 text-sky-700 border-sky-200'              },
    none:   { label: 'No device', classes: 'bg-slate-100 text-slate-600 border-slate-200'       },
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Customer Insights</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor user engagement, device health, and activity patterns.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={generateReport} disabled={reportLoading}
            className="inline-flex items-center gap-2 bg-[#195C51] text-white hover:bg-[#0E3A32] px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50">
            {reportLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText className="w-4 h-4" />}
            {reportLoading ? 'Generating…' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* ── Unified Scope Controls ────────────────────────────────────────── */}
      {/* One panel drives roles + time window for ALL analytics sections.    */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Role scope */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Settings2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scope:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_OPTIONS.map(o => (
                <button key={o.value} onClick={() => { setRoles(o.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                    ${roles === o.value
                      ? 'bg-[#195C51] text-white border-[#195C51]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px sm:h-8 sm:w-px bg-slate-200" />

          {/* Time window — applies to stats, trends, heatmap, leaderboard */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Window:</span>
            </div>
            <TimeWindowPicker value={timeWindow} onChange={(w) => { setTimeWindow(w); setPage(1); }} />
          </div>

          {/* Window label pill */}
          <div className="shrink-0 hidden lg:flex items-center gap-2 bg-[#195C51]/5 border border-[#195C51]/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#195C51]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#195C51]">
              {timeRange.label}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-3 font-medium">
          ↑ Applies to: KPI stats · activity trend · heatmap · leaderboard — Table always shows all-time records, filtered separately below.
        </p>
      </div>

      {/* ── Section 1: KPI Stats ─────────────────────────────────────────── */}
      {gs && (
        <div className="space-y-4">

          {/* Row 1 — user counts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total Users"      value={gs.totalUsers}             icon={Users}     accent="teal"
              onClick={() => filterDirectory({})} />
            <StatCard label="Active Accounts"  value={gs.activeUsers}            icon={BadgeCheck} accent="green"
              onClick={() => filterDirectory({ status: 'active' })}
              active={filters.status === 'active'} />
            <StatCard label="Deactivated"      value={gs.deactivatedUsers}       icon={BadgeX}    accent="red"    sub="Accounts"
              onClick={() => filterDirectory({ status: 'deactivated' })}
              active={filters.status === 'deactivated'} />
            <StatCard label="Verified"         value={gs.verifiedUsers}          icon={Shield}    accent="blue" />
            <StatCard label="Active Plans"     value={gs.totalActiveSubscriptions} icon={Zap}    accent="amber"
              onClick={() => filterDirectory({ subscriptionStatus: 'active' })}
              active={filters.subscriptionStatus === 'active'} />
            <StatCard label="Active Shares"    value={gs.sharing?.totalActiveShares} icon={Share2} accent="purple"
              onClick={() => filterDirectory({ hasRemotes: 'true', sortBy: 'sharesGiven', order: 'desc' })} />
          </div>

          {/* Row 2 — subscription metrics */}
          {gs.subscriptionStatusBreakdown && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">With Any Sub</p>
                <p className="text-xl font-bold text-slate-900">{gs.usersWithAnySubscription ?? '—'}</p>
                <p className="text-[10px] text-slate-400">Of {gs.totalUsers} total</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Subscription</p>
                <p className="text-xl font-bold text-amber-600">{gs.usersWithNoSubscription ?? '—'}</p>
                <button onClick={() => filterDirectory({ subscriptionStatus: 'none' })}
                  className="text-[10px] text-slate-400 hover:text-[#195C51] text-left font-medium transition-colors">
                  Filter in directory →
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Users Who Share</p>
                <p className="text-xl font-bold text-slate-900">{gs.sharing?.usersWhoShare ?? '—'}</p>
                <p className="text-[10px] text-slate-400">Avg {gs.sharing?.avgSharesPerSharer ?? 0} shares/sharer</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1 cursor-pointer hover:border-slate-300 transition-colors"
                onClick={() => filterDirectory({ hasRemotes: 'true', sortBy: 'sharesGiven', order: 'asc' })}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Never Shared</p>
                <p className="text-xl font-bold text-slate-900">{gs.sharing?.usersWhoNeverShared ?? '—'}</p>
                <p className="text-[10px] text-slate-400 hover:text-[#195C51]">Own remote but share 0</p>
              </div>
            </div>
          )}

          {/* Row 3 — device health */}
          {gs.deviceHealth && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-0.5">Device Health — click any card for details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard label="With Remotes"    value={gs.deviceHealth.usersWithRemotes}           icon={Wifi}    accent="teal"
                  onClick={() => setConnectivityModal('withRemotes')} />
                <StatCard label="All Online"      value={gs.deviceHealth.usersAllRemotesOnline}      icon={Wifi}    accent="green"
                  onClick={() => setConnectivityModal('allOnline')}
                  active={filters.deviceOnlineStatus === 'allOnline'} />
                <StatCard label="Mixed Status"    value={gs.deviceHealth.usersMixedOnlineOffline}    icon={Activity} accent="amber"
                  onClick={() => setConnectivityModal('mixed')}
                  active={filters.deviceOnlineStatus === 'mixed'} />
                <StatCard label="All Offline"     value={gs.deviceHealth.usersAllRemotesOffline}     icon={WifiOff} accent="red"
                  onClick={() => setConnectivityModal('allOffline')}
                  active={filters.deviceOnlineStatus === 'allOffline'} />
                <StatCard label="Never Connected" value={gs.deviceHealth.usersRemotesNeverConnected} icon={Clock}   accent="slate"
                  onClick={() => setConnectivityModal('noneEver')}
                  active={filters.deviceOnlineStatus === 'noneEver'} />
                <StatCard label="No Device"       value={gs.deviceHealth.usersWithoutRemotes}        icon={Users}   accent="slate" sub="App-only"
                  onClick={() => setConnectivityModal('noDevice')}
                  active={filters.hasRemotes === 'false'} />
              </div>
            </div>
          )}

          {/* Row 4 — subscription status pills */}
          {gs.subscriptionStatusBreakdown && (
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subscription Status — click to drill in</p>
                {gs.subscriptionBreakdown?.length > 0 && (
                  <button onClick={() => setSubBreakdownOpen(v => !v)}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#195C51] transition-colors">
                    <BarChart2 className="w-3 h-3" />
                    {subBreakdownOpen ? 'Hide' : 'Plan chart'}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(gs.subscriptionStatusBreakdown)
                  .filter(([, v]) => v > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => (
                    <button key={status} onClick={() => setSubscriptionModal(status)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:shadow-sm
                        ${filters.subscriptionStatus === status
                          ? 'bg-[#195C51] text-white border-[#195C51]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}>
                      {subscriptionLabel(status)}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                        ${filters.subscriptionStatus === status ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {count}
                      </span>
                    </button>
                  ))}
              </div>
              {subBreakdownOpen && gs.subscriptionBreakdown?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Active Plan Distribution</p>
                  <SubscriptionBreakdownChart data={gs.subscriptionBreakdown} />
                </div>
              )}
            </div>
          )}

          {/* Row 5 — role breakdown + sharing mini-stats */}
          {gs.roleBreakdown && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role:</span>
              {Object.entries(gs.roleBreakdown).filter(([, v]) => v > 0).map(([role, count]) => (
                <button key={role}
                  onClick={() => filterDirectory({ roles: role })}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                    ${filters.roles === role
                      ? 'bg-[#195C51] text-white border-[#195C51]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {role}
                  <span className={`text-[10px] font-bold ${filters.roles === role ? 'opacity-80' : 'text-slate-400'}`}>{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Row 6 — device usage mini-stats */}
          {gs.deviceUsage && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Events</p>
                <p className="text-xl font-bold text-slate-900">{(gs.deviceUsage.totalEventsAllTime || 0).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">In window: {timeRange.label}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Events/Remote</p>
                <p className="text-xl font-bold text-slate-900">{gs.deviceUsage.avgEventsPerRemote || 0}</p>
                <p className="text-[10px] text-slate-400">Fleet average</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg Uptime/Remote</p>
                <p className="text-xl font-bold text-slate-900">{gs.deviceUsage.avgUptimePerRemoteFormatted || '—'}</p>
                <p className="text-[10px] text-slate-400">Per deployed remote</p>
              </div>
              <div
                className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-1 cursor-pointer hover:border-red-300 transition-colors group"
                onClick={() => filterDirectory({ sortBy: 'offlineIncidents', order: 'desc', hasRemotes: 'true' })}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Incidents</p>
                <p className="text-xl font-bold text-red-600">{(gs.deviceUsage.totalOfflineIncidents || 0).toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 group-hover:text-red-500 transition-colors">Sort by incidents →</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Section 2: Graphs & Leaderboard ─────────────────────────────── */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Activity Trend */}
          <Card className="p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[#195C51]" />
              <h2 className="font-display font-semibold text-lg">Activity Trend</h2>
              <span className="ml-auto text-[10px] bg-[#195C51]/10 text-[#195C51] border border-[#195C51]/20 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">
                {timeRange.label}
              </span>
            </div>
            <div className="h-[250px] w-full flex items-center justify-center bg-slate-50/50 rounded-lg border border-slate-100">
              {loading ? (
                <Spinner label="Loading trends…" />
              ) : (() => {
                const data = fleetActivity.length > 0 ? fleetActivity : buildZeroedSeries(timeRange);
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                        cursor={{ stroke: '#195C51', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Line type="monotone" dataKey="count" name="Interactions" stroke="#195C51" strokeWidth={3}
                        dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </Card>

          {/* Heatmap */}
          <Card className="p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-[#195C51]" />
              <h2 className="font-display font-semibold text-lg">Peak Usage Heatmap</h2>
              <span className="ml-auto text-[10px] bg-[#195C51]/10 text-[#195C51] border border-[#195C51]/20 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">
                {timeRange.label}
              </span>
            </div>
            <div className="flex-1 overflow-x-auto flex items-center justify-center bg-slate-50/50 rounded-lg border border-slate-100 p-4">
              {loading ? (
                <Spinner label="Computing heatmap…" />
              ) : fleetHeatmap.length > 0 ? (
                <HeatmapGrid rows={fleetHeatmap} maxVal={maxHeatmapVal} />
              ) : (
                <p className="text-sm text-slate-400 font-medium">No heatmap data for this window.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Leaderboard & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Leaderboard */}
          <Card className="lg:col-span-2 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-semibold text-lg">Most Engaged Customers</h2>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                Ranked by active days · {timeRange.label}
              </span>
            </div>
            <div className="space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500 text-center py-4 animate-pulse">Syncing rankings…</p>
              ) : leaderboard.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No activity in this period.</p>
              ) : leaderboard.map((user, idx) => {
                const meta = ROLE_META[user.role] || ROLE_META.none;
                return (
                  <div key={user.id} onClick={() => setInspectUserId(user.id)}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm shrink-0
                        ${idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          idx === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                          idx === 2 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PrivacyNameToggle fullName={user.displayName} />
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${meta.classes}`}>{meta.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{maskEmail(user.email)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3 flex items-center gap-3">
                      <div>
                        <p className="text-lg font-bold text-[#195C51] leading-none">{user.activeDays}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Active days</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{user.totalEvents} interactions</p>
                      </div>
                      <Eye className="w-4 h-4 text-slate-300 group-hover:text-[#195C51] transition-colors shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Alerts */}
          <Card className="lg:col-span-1 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="font-display font-semibold text-lg">System Alerts</h2>
              </div>
              <select value={alertTime} onChange={(e) => setAlertTime(Number(e.target.value))}
                className="text-xs bg-slate-100 border-none rounded-md px-2 py-1 font-medium text-slate-700 outline-none cursor-pointer">
                <option value={1}>Today</option>
                <option value={7}>This Week</option>
                <option value={30}>This Month</option>
                <option value={365}>This Year</option>
              </select>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Users with ≥{5 * alertTime} total offline incidents over {alertTime === 1 ? 'today' : `${alertTime} days`}.
            </p>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[250px]">
              {alertsLoading ? (
                <p className="text-sm text-slate-400 text-center py-4">Checking health…</p>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                    <span className="text-emerald-500 text-xl">✓</span>
                  </div>
                  <p className="text-sm font-medium">All systems healthy.</p>
                </div>
              ) : alerts.map(u => (
                <div key={u.id} className="p-3 bg-red-50/50 border border-red-100 rounded-lg flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <PrivacyNameToggle fullName={u.displayName} />
                    <p className="text-[10px] text-red-600 font-medium mt-0.5">{u.devices?.totalOfflineIncidents} offline events</p>
                    {u.devices?.longestCurrentOffline && (
                      <p className="text-[10px] text-slate-500">Longest: {u.devices.longestCurrentOffline}</p>
                    )}
                  </div>
                  <button onClick={() => setInspectUserId(u.id)}
                    className="text-[10px] uppercase tracking-wider font-bold text-red-700 hover:underline shrink-0">
                    Inspect
                  </button>
                </div>
              ))}
            </div>
            {alerts.length > 0 && (
              <button onClick={() => filterDirectory({ sortBy: 'offlineIncidents', order: 'desc', hasRemotes: 'true' })}
                className="mt-3 w-full text-center text-[10px] uppercase tracking-wider font-bold text-red-600 hover:text-red-800 border border-red-100 hover:border-red-200 rounded-lg py-2 transition-colors">
                View all in directory →
              </button>
            )}
          </Card>
        </div>
      </div>

      {/* ── Section 3: Customer Directory ────────────────────────────────── */}
      <Card id="customer-directory" className="overflow-hidden scroll-m-24">

        {/* Table Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col gap-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Customer Directory</h2>
              <p className="text-xs text-slate-500 mt-1">
                {loading
                  ? 'Loading…'
                  : `${pagination.total} account${pagination.total !== 1 ? 's' : ''} — page ${Math.min(page, pagination.totalPages || 1)} of ${pagination.totalPages || 1}`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search by name…" value={pendingFilters.search}
                  onChange={e => setPendingFilters(f => ({ ...f, search: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') applyFilters(); }}
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#195C51] focus:ring-1 focus:ring-[#195C51]/20 w-56 transition-all" />
              </div>
              <button onClick={() => { setPendingFilters({ ...filters }); setFilterPanelOpen(v => !v); }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all
                  ${filterPanelOpen || activeFilterCount > 0
                    ? 'bg-[#195C51] text-white border-[#195C51]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}>
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600 transition-all">
                  <RotateCcw className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Sort bar */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort by:</span>
            {SORT_OPTIONS.slice(0, 5).map(opt => (
              <SortButton key={opt.value} sortBy={sortBy} order={order} field={opt.value} label={opt.label} onChange={handleSortChange} />
            ))}
            <select
              value={SORT_OPTIONS.slice(5).find(o => o.value === sortBy) ? sortBy : ''}
              onChange={e => { if (e.target.value) handleSortChange(e.target.value, 'desc'); }}
              className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-600 outline-none cursor-pointer hover:border-slate-300">
              <option value="">More sorts…</option>
              {SORT_OPTIONS.slice(5).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button onClick={() => setOrder(o => o === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#195C51] px-2 py-1 rounded border border-slate-200 bg-white hover:border-slate-300 transition-all">
              {order === 'desc' ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {order === 'desc' ? 'Desc' : 'Asc'}
            </button>
            {SORT_OPTIONS.find(o => o.value === sortBy)?.group === 'computed' && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                ⚡ Computed sort — may be slower
              </span>
            )}
          </div>

          {/* Filter panel */}
          {filterPanelOpen && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <FilterField label="Account Status">
                  <select value={pendingFilters.status} onChange={e => setPendingFilters(f => ({ ...f, status: e.target.value }))}
                    className={filterSelectClass}>
                    {ACCOUNT_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterField>
                <FilterField label="Role (table only)">
                  <select value={pendingFilters.roles} onChange={e => setPendingFilters(f => ({ ...f, roles: e.target.value }))}
                    className={filterSelectClass}>
                    {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterField>
                <FilterField label="Subscription Status">
                  <select value={pendingFilters.subscriptionStatus} onChange={e => setPendingFilters(f => ({ ...f, subscriptionStatus: e.target.value }))}
                    className={filterSelectClass}>
                    {SUBSCRIPTION_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterField>
                <FilterField label="Device Connectivity">
                  <select value={pendingFilters.deviceOnlineStatus} onChange={e => setPendingFilters(f => ({ ...f, deviceOnlineStatus: e.target.value }))}
                    className={filterSelectClass}>
                    {DEVICE_ONLINE_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FilterField>
                <FilterField label="Has Remotes">
                  <select value={pendingFilters.hasRemotes} onChange={e => setPendingFilters(f => ({ ...f, hasRemotes: e.target.value }))}
                    className={filterSelectClass}>
                    <option value="">Any</option>
                    <option value="true">Owns at least one</option>
                    <option value="false">No remotes</option>
                  </select>
                </FilterField>
                <FilterField label="Country (ISO)">
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="text" maxLength={2} placeholder="e.g. RW"
                      value={pendingFilters.country}
                      onChange={e => setPendingFilters(f => ({ ...f, country: e.target.value.toUpperCase() }))}
                      className={`${filterInputClass} pl-8`} />
                  </div>
                </FilterField>
                <FilterField label="Offline Incidents ≥">
                  <input type="number" min={0} placeholder="e.g. 5"
                    value={pendingFilters.offlineIncidentsMin}
                    onChange={e => setPendingFilters(f => ({ ...f, offlineIncidentsMin: e.target.value }))}
                    className={filterInputClass} />
                </FilterField>
                <FilterField label="Offline Incidents ≤">
                  <input type="number" min={0} placeholder="e.g. 50"
                    value={pendingFilters.offlineIncidentsMax}
                    onChange={e => setPendingFilters(f => ({ ...f, offlineIncidentsMax: e.target.value }))}
                    className={filterInputClass} />
                </FilterField>
                <FilterField label="Currently Offline ≥ Hours">
                  <input type="number" min={0} step={0.5} placeholder="e.g. 24"
                    value={pendingFilters.currentOfflineMinHours}
                    onChange={e => setPendingFilters(f => ({ ...f, currentOfflineMinHours: e.target.value }))}
                    className={filterInputClass} />
                </FilterField>
              </div>

              {/* Quick presets */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Presets</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '🔴 Expired subs',   patch: { subscriptionStatus: 'expired' } },
                    { label: '❌ All offline',     patch: { deviceOnlineStatus: 'allOffline', hasRemotes: 'true' } },
                    { label: '⭕ Never connected', patch: { deviceOnlineStatus: 'noneEver',   hasRemotes: 'true' } },
                    { label: '📤 High sharers',    patch: { hasRemotes: 'true' }, sort: { sortBy: 'sharesGiven',      order: 'desc' } },
                    { label: '🚨 High incidents',  patch: { offlineIncidentsMin: '10' },     sort: { sortBy: 'offlineIncidents', order: 'desc' } },
                    { label: '✅ Active + online', patch: { status: 'active', deviceOnlineStatus: 'allOnline' } },
                  ].map(preset => (
                    <button key={preset.label}
                      onClick={() => {
                        const newFilters = { ...defaultFilters(), ...preset.patch };
                        setPendingFilters(newFilters);
                        setFilters(newFilters);
                        if (preset.sort) { setSortBy(preset.sort.sortBy); setOrder(preset.sort.order); }
                        setPage(1);
                        setFilterPanelOpen(false);
                      }}
                      className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 hover:border-[#195C51] hover:text-[#195C51] text-xs font-medium px-3 py-1.5 rounded-lg transition-all">
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => setFilterPanelOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={resetFilters}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-100">Reset All</button>
                <button onClick={applyFilters}
                  className="inline-flex items-center gap-2 bg-[#195C51] text-white hover:bg-[#0E3A32] px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
                  <Filter className="w-3.5 h-3.5" /> Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).filter(([k, v]) => v && k !== 'search').map(([key, val]) => (
                <span key={key}
                  className="inline-flex items-center gap-1.5 bg-[#195C51]/10 text-[#195C51] border border-[#195C51]/20 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {FILTER_LABELS[key] || key}: {val}
                  <button onClick={() => { const f = { ...filters, [key]: '' }; setFilters(f); setPendingFilters(f); setPage(1); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4"><SortButton sortBy={sortBy} order={order} field="firstName"       label="Customer"  onChange={handleSortChange} /></th>
                <th className="px-6 py-4"><SortButton sortBy={sortBy} order={order} field="status"          label="Subscription" onChange={handleSortChange} /></th>
                <th className="px-6 py-4"><SortButton sortBy={sortBy} order={order} field="country"         label="Location"  onChange={handleSortChange} /></th>
                <th className="px-6 py-4"><SortButton sortBy={sortBy} order={order} field="remoteCount"     label="Hardware"  onChange={handleSortChange} /></th>
                <th className="px-6 py-4"><SortButton sortBy={sortBy} order={order} field="totalEvents"     label="Events"    onChange={handleSortChange} /></th>
                <th className="px-6 py-4"><SortButton sortBy={sortBy} order={order} field="offlineIncidents"label="Incidents" onChange={handleSortChange} /></th>
                <th className="px-6 py-4"><SortButton sortBy={sortBy} order={order} field="sharesGiven"     label="Shares"    onChange={handleSortChange} /></th>
                <th className="px-6 py-4"><SortButton sortBy={sortBy} order={order} field="lastActivity"    label="Last Active" onChange={handleSortChange} /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin" />
                    Loading customers…
                  </div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center">
                  <p className="text-slate-500 font-medium">No customers match these filters.</p>
                  <button onClick={resetFilters} className="mt-2 text-xs text-[#195C51] hover:underline font-semibold">Clear all filters</button>
                </td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => setInspectUserId(user.id)}>

                  {/* Customer name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded-md text-slate-300 group-hover:text-[#195C51] group-hover:bg-[#195C51]/10 transition-colors">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PrivacyNameToggle fullName={user.displayName} />
                          {(() => {
                            const role = getUserRole(user);
                            const meta = ROLE_META[role];
                            return <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${meta.classes}`}>{meta.label}</span>;
                          })()}
                          {user.role === 'special' && <Star className="w-3.5 h-3.5 text-amber-500" title="Special role" />}
                          {!user.isVerified && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Unverified</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Subscription */}
                  <td className="px-6 py-4">
                    {user.hasActiveSubscription ? (
                      <Badge variant="success">Active Plan</Badge>
                    ) : user.latestSubscription ? (
                      <Badge variant={subscriptionVariant(user.latestSubscription.status)}>
                        {subscriptionLabel(user.latestSubscription.status)}
                      </Badge>
                    ) : (
                      <Badge variant="warning">No Plan</Badge>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4 text-slate-600 font-medium">{user.country || '—'}</td>

                  {/* Hardware */}
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {(() => {
                      const owned    = user.devices?.owned    || 0;
                      const received = user.sharing?.sharesReceived || 0;
                      if (owned > 0) return (
                        <div className="flex flex-col gap-0.5">
                          <span><span className="text-[#195C51] font-bold">{owned}</span> Owned</span>
                          {received > 0 && <span className="text-xs text-sky-700">+<span className="font-bold">{received}</span> shared</span>}
                          {user.devices?.currentlyOnline > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{user.devices.currentlyOnline} online
                            </span>
                          )}
                          {user.devices?.currentlyOffline > 0 && user.devices.currentlyOnline === 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />all offline
                            </span>
                          )}
                        </div>
                      );
                      if (received > 0) return <span><span className="text-sky-700 font-bold">{received}</span> Shared</span>;
                      return <span className="text-slate-400">—</span>;
                    })()}
                  </td>

                  {/* Events */}
                  <td className="px-6 py-4">
                    {user.devices?.totalEvents > 0 ? (
                      <div>
                        <p className="font-bold text-slate-800">{user.devices.totalEvents.toLocaleString()}</p>
                        {user.devices.avgEventsPerRemote > 0 && (
                          <p className="text-[10px] text-slate-400">{user.devices.avgEventsPerRemote}/remote avg</p>
                        )}
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>

                  {/* Offline incidents */}
                  <td className="px-6 py-4">
                    {user.devices?.totalOfflineIncidents > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-bold ${user.devices.totalOfflineIncidents >= 20 ? 'text-red-600' : user.devices.totalOfflineIncidents >= 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {user.devices.totalOfflineIncidents}
                        </span>
                        {user.devices.longestCurrentOffline && user.devices.longestCurrentOffline !== '0s' && (
                          <span className="text-[10px] text-red-500 font-medium">{user.devices.longestCurrentOffline} offline</span>
                        )}
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>

                  {/* Shares */}
                  <td className="px-6 py-4">
                    {(user.sharing?.sharesGiven > 0 || user.sharing?.sharesReceived > 0) ? (
                      <div className="flex flex-col gap-0.5">
                        {user.sharing?.sharesGiven    > 0 && <span className="text-xs text-slate-700"><strong>{user.sharing.sharesGiven}</strong> given</span>}
                        {user.sharing?.sharesReceived > 0 && <span className="text-xs text-sky-600"><strong>{user.sharing.sharesReceived}</strong> received</span>}
                      </div>
                    ) : <span className="text-slate-400">—</span>}
                  </td>

                  {/* Last active */}
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {user.devices?.lastUsedAt
                      ? new Date(user.devices.lastUsedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{(Math.min(page, pagination.totalPages || 1) - 1) * PAGE_SIZE + 1}</span>
              –<span className="font-semibold text-slate-700">{Math.min(Math.min(page, pagination.totalPages || 1) * PAGE_SIZE, pagination.total)}</span>
              {' '}of <span className="font-semibold text-slate-700">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(1)} disabled={page <= 1}
                className="px-2 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronFirst className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">
                Previous
              </button>
              <span className="text-xs text-slate-600 font-medium px-2">
                Page <span className="font-bold text-slate-900">{Math.min(page, pagination.totalPages || 1)}</span> of {pagination.totalPages || 1}
              </span>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= (pagination.totalPages || 1)}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">
                Next
              </button>
              <button onClick={() => setPage(pagination.totalPages)} disabled={page >= (pagination.totalPages || 1)}
                className="px-2 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLast className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ── User Inspect Modal ────────────────────────────────────────────── */}
      {inspectUserId && (
        <UserInspectModal userId={inspectUserId} onClose={() => setInspectUserId(null)} />
      )}

      {/* ── Connectivity Modal ────────────────────────────────────────────── */}
      {connectivityModal && (
        <ConnectivityModal type={connectivityModal} globalStats={globalStats}
          onClose={() => setConnectivityModal(null)} onFilterDirectory={filterDirectory} />
      )}

      {/* ── Subscription Modal ────────────────────────────────────────────── */}
      {subscriptionModal && (
        <SubscriptionModal status={subscriptionModal} globalStats={globalStats}
          onClose={() => setSubscriptionModal(null)} onFilterDirectory={filterDirectory} />
      )}

      {/* ── Report Modal ──────────────────────────────────────────────────── */}
      {reportOpen && reportData && (
        <ReportModal
          data={reportData}
          windowLabel={timeRange.label}
          rolesLabel={ROLE_OPTIONS.find(o => o.value === roles)?.label || 'All roles'}
          refEl={reportRef}
          onClose={() => setReportOpen(false)}
          onPrint={() => window.print()}
          onDownload={downloadPdf}
        />
      )}
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
// Assembled entirely from data already in state — no separate endpoint needed.

const ReportModal = ({ data, windowLabel, rolesLabel, refEl, onClose, onPrint, onDownload }) => {
  const { globalStats, users, leaderboard, fleetTrends } = data;
  const gs = globalStats;

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto print:bg-white print:static print:block">
      <div className="max-w-4xl w-full mx-auto my-6 print:m-0 print:max-w-none">

        {/* Toolbar (hidden on print) */}
        <div className="flex items-center justify-between bg-white rounded-t-2xl px-5 py-3 border border-b-0 border-slate-200 shadow-sm print:hidden sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#195C51]" />
            <h2 className="font-display font-bold text-base text-slate-900">Customer Insights Report</h2>
            <span className="text-xs text-slate-400 font-medium">· {windowLabel} · {rolesLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onPrint}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={onDownload}
              className="inline-flex items-center gap-1.5 bg-[#195C51] text-white hover:bg-[#0E3A32] px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Report body */}
        <div ref={refEl} className="bg-white rounded-b-2xl border border-slate-200 shadow-sm p-8 print:border-0 print:shadow-none print:rounded-none print:p-6">

          {/* Header */}
          <div className="mb-6 pb-4 border-b border-slate-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#195C51] mb-1">Customer Insights</p>
            <h1 className="font-display font-bold text-2xl text-slate-900">Analytics Report</h1>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
              <span><strong>Window:</strong> {windowLabel}</span>
              <span><strong>Scope:</strong> {rolesLabel}</span>
              <span><strong>Generated:</strong> {fmtDate(new Date())}</span>
            </div>
          </div>

          {/* Overview KPIs */}
          {gs && (
            <section className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Overview</h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Users',     val: gs.totalUsers,               color: 'text-slate-900' },
                  { label: 'Active Plans',    val: gs.totalActiveSubscriptions,  color: 'text-slate-900' },
                  { label: 'Active Shares',   val: gs.sharing?.totalActiveShares, color: 'text-slate-900' },
                  { label: 'With Remotes',    val: gs.deviceHealth?.usersWithRemotes, color: 'text-[#195C51]' },
                ].map(k => (
                  <div key={k.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{k.label}</p>
                    <p className={`text-2xl font-bold ${k.color}`}>{k.val ?? '—'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Subscription breakdown */}
          {gs?.subscriptionStatusBreakdown && (
            <section className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Subscription Status</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(gs.subscriptionStatusBreakdown).filter(([, v]) => v > 0).map(([status, count]) => (
                  <div key={status} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">{subscriptionLabel(status)}</span>
                    <span className="text-xs font-bold text-[#195C51]">{count}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sharing metrics */}
          {gs?.sharing && (
            <section className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Sharing Overview</h2>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Active Shares', val: gs.sharing.totalActiveShares },
                  { label: 'Users Who Share',     val: gs.sharing.usersWhoShare     },
                  { label: 'Avg Shares/Sharer',   val: gs.sharing.avgSharesPerSharer },
                  { label: 'Never Shared',        val: gs.sharing.usersWhoNeverShared },
                ].map(k => (
                  <div key={k.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{k.label}</p>
                    <p className="text-xl font-bold text-slate-900">{k.val ?? '—'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Activity trend */}
          {fleetTrends?.activityTrend?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Daily Activity Trend</h2>
              <div className="h-[180px] bg-slate-50 border border-slate-200 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fleetTrends.activityTrend} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B' }} />
                    <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                    <Line type="monotone" dataKey="count" stroke="#195C51" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Leaderboard */}
          {leaderboard?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Engagement Leaderboard</h2>
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider">#</th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider">User</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider">Active Days</th>
                    <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider">Total Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((u, i) => (
                    <tr key={u.id}>
                      <td className="px-3 py-2 font-bold text-slate-400">{i + 1}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{u.displayName}</td>
                      <td className="px-3 py-2 text-right font-bold text-[#195C51]">{u.activeDays}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{u.totalEvents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* User snapshot */}
          {users?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">User Snapshot (first {users.length})</h2>
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Country</th>
                    <th className="px-3 py-2 text-right font-semibold">Remotes</th>
                    <th className="px-3 py-2 text-right font-semibold">Events</th>
                    <th className="px-3 py-2 text-right font-semibold">Incidents</th>
                    <th className="px-3 py-2 text-left font-semibold">Subscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.slice(0, 20).map(u => (
                    <tr key={u.id}>
                      <td className="px-3 py-2 font-semibold text-slate-800">{u.displayName}</td>
                      <td className="px-3 py-2 text-slate-600">{u.country || '—'}</td>
                      <td className="px-3 py-2 text-right">{u.devices?.owned || 0}</td>
                      <td className="px-3 py-2 text-right">{u.devices?.totalEvents?.toLocaleString() || '—'}</td>
                      <td className="px-3 py-2 text-right font-medium" style={{ color: (u.devices?.totalOfflineIncidents || 0) >= 10 ? '#dc2626' : undefined }}>
                        {u.devices?.totalOfflineIncidents || '—'}
                      </td>
                      <td className="px-3 py-2">
                        {u.hasActiveSubscription ? 'Active' : u.latestSubscription ? subscriptionLabel(u.latestSubscription.status) : 'No Plan'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-400">© {new Date().getFullYear()} · Customer Insights Analytics Report</p>
          </div>
        </div>
      </div>
    </div>
  );
};