import React, { useState, useEffect, useMemo } from 'react';
import { 
    MdWifi, 
    MdWifiOff, 
    MdRefresh, 
    MdErrorOutline,
    MdTrendingUp, 
    MdOutlineInventory2, 
    MdOutlineTouchApp, 
    MdOutlineQueryBuilder,
    MdOutlineSensors,
    MdOutlineHourglassEmpty,
    MdCheckCircleOutline,
    MdDoNotDisturbOn
} from 'react-icons/md';
import { fetchData, returnToken } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";

const OnlineDevicesDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [investorStats, setInvestorStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState(1);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = returnToken();
      const devicesUrl = `${presence_server}/statistics/recently-online?hours=${hours}`;
      const investorUrl = `${presence_server}/statistics/investor`;

      const [devicesRes, investorRes] = await Promise.all([
        fetchData(devicesUrl, token),
        fetchData(investorUrl, token)
      ]);

      if (devicesRes.error) throw new Error(devicesRes.error);
      if (investorRes.error) throw new Error(investorRes.error);

      setDevices(devicesRes.data.devices || []);
      setInvestorStats(investorRes.data);
    } catch (err) {
      setError(err.message || "Cloud synchronization failed");
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000);
    return () => clearInterval(interval);
  }, [hours]);

  const isCurrentlyOnline = (device) => {
    const lastHeartbeat = new Date(device.lastHeartbeatAt);
    return lastHeartbeat >= new Date(Date.now() - 5 * 60 * 1000);
  };

  return (
    <div className="space-y-8 animate-slide-entrance pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-bold text-[#333333]">System Analytics</h1>
          <p className="text-sm text-gray-500 font-medium">Real-time performance and adoption metrics.</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Last Sync: {lastRefresh.toLocaleTimeString()}
            </span>
            <button 
                onClick={loadAnalytics}
                className="p-3 bg-white border border-gray-100 rounded-2xl text-[#195C51] shadow-sm hover:bg-gray-50 transition-all"
            >
                <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {error && (
        <div className="mx-2 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
          <MdErrorOutline size={20} />
          <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* Investor Analytics Grid */}
      {investorStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          <StatCard title="Units in Field" value={investorStats.totalSold} subtitle="Total remotes registered" icon={<MdOutlineInventory2 size={24}/>} />
          <StatCard title="Daily Active Rate" value={`${investorStats.onlineDailyPercent}%`} subtitle="Devices synced last 24h" icon={<MdOutlineSensors size={24}/>} color="text-blue-600" />
          <StatCard title="Weekly Retention" value={`${investorStats.activeWeeklyPercent}%`} subtitle="Consistent users this week" icon={<MdTrendingUp size={24}/>} color="text-green-600" />
          <StatCard title="Avg. Interaction" value={investorStats.avgInteractionsPerDay} subtitle="Commands per day / unit" icon={<MdOutlineTouchApp size={24}/>} />
          <StatCard title="System Longevity" value={`${investorStats.availableUsageDays} Days`} subtitle="Total uptime tracked" icon={<MdOutlineQueryBuilder size={24}/>} />
          <StatCard title="Shelfware Rate" value={`${investorStats.shelfwarePercent}%`} subtitle="Inactive / Unused stock" icon={<MdOutlineHourglassEmpty size={24}/>} color="text-orange-600" />
        </div>
      )}

      {/* Connectivity Table */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center justify-between px-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#195C51] animate-pulse"></div>
                Live Connectivity Stream
            </h2>
            <select
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#195C51] shadow-sm outline-none cursor-pointer"
            >
                {[1, 3, 6, 12, 24].map(h => <option key={h} value={h}>Last {h} Hours</option>)}
            </select>
        </div>

        <div className="google-card overflow-hidden bg-white mx-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F5F5F5]/60 border-b border-gray-100">
                <tr>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Node Status</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Hardware Model</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Enabled</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Last Used</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Ping (Signal)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {devices.map(device => {
                  const online = isCurrentlyOnline(device);
                  return (
                    <tr key={device._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5">
                        <div className={`flex items-center gap-2 ${online ? 'text-green-600' : 'text-gray-300'}`}>
                          {online ? <MdWifi size={18}/> : <MdWifiOff size={18}/>}
                          <span className="text-[10px] font-black uppercase tracking-widest">{online ? 'Online' : 'Latency'}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-[#333333] text-sm uppercase">{device.modelType}</div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">v{device.version} • {device.manufacture}</div>
                      </td>
                      <td className="p-5 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${device.isEnabled ? 'bg-green-50 text-[#195C51] border-[#195C51]/10' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                            {device.isEnabled ? <MdCheckCircleOutline size={14}/> : <MdDoNotDisturbOn size={14}/>}
                            {device.isEnabled ? 'Active' : 'Locked'}
                        </div>
                      </td>
                      <td className="p-5 text-xs font-medium text-gray-500">
                        {formatDate(device.lastUsedAt)}
                      </td>
                      <td className="p-5 text-right text-xs font-bold text-[#195C51]">
                        {online ? 'Now' : formatDate(device.lastHeartbeatAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {devices.length === 0 && !loading && (
              <div className="p-20 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  No active signals detected.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color = "text-[#195C51]" }) => (
    <div className="google-card p-8 group hover:border-[#195C51]/20 transition-all bg-white">
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</p>
                <h3 className={`text-3xl font-bold ${color} tracking-tighter`}>{value}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-[#F5F5F5] text-gray-400 group-hover:text-[#195C51] group-hover:bg-[#195C51]/5 transition-all">
                {icon}
            </div>
        </div>
        <p className="mt-6 text-[11px] font-medium text-gray-400 italic">"{subtitle}"</p>
    </div>
);

const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    const now = new Date();
    const diff = (now - d) / 1000 / 60; // in minutes

    if (diff < 1) return "Seconds ago";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
}

export default OnlineDevicesDashboard;