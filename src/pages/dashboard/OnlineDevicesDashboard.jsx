import { useState, useEffect } from "react";
import { fetchData, returnToken, getOwnerLabel } from "../../utils/helper.js"; // Added getOwnerLabel
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
  MdMap,
  MdList,
  MdPinDrop,
} from "react-icons/md";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Essential for map styling
import { presence_server } from "../../config/server_api.js";

const OnlineDevicesDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [investorStats, setInvestorStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState(1);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'map'
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
        fetchData(investorUrl, token),
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
    const interval = setInterval(loadAnalytics, 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, [hours]);

  const isCurrentlyOnline = (device) => {
    if (!device.lastHeartbeatAt) return false;
    const lastHeartbeat = new Date(device.lastHeartbeatAt);
    return lastHeartbeat >= new Date(Date.now() - 5 * 60 * 1000); // 5 min window
  };

  return (
    <div className="space-y-8 animate-slide-entrance pb-10">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-bold text-[#333333]">
            Network Intelligence
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Real-time status and geographic distribution of field nodes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* View Switcher */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === "table"
                  ? "bg-[#195C51] text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <MdList size={18} /> List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                viewMode === "map"
                  ? "bg-[#195C51] text-white shadow-lg"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <MdMap size={18} /> Live Map
            </button>
          </div>

          <div className="h-10 w-[1px] bg-gray-200 hidden md:block"></div>

          <button
            onClick={loadAnalytics}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-[#195C51] shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 group"
          >
            <MdRefresh
              size={20}
              className={
                loading
                  ? "animate-spin"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-2 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
          <MdErrorOutline size={20} />
          <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* High-Level KPIs */}
      {investorStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          <StatCard
            title="Active Fleet"
            value={investorStats.totalSold}
            subtitle="Total provisioned units"
            icon={<MdOutlineInventory2 size={24} />}
          />
          <StatCard
            title="Sync Rate"
            value={`${investorStats.onlineDailyPercent}%`}
            subtitle="Nodes active in last 24h"
            icon={<MdOutlineSensors size={24} />}
            color="text-blue-600"
          />
          <StatCard
            title="Usage Frequency"
            value={investorStats.avgInteractionsPerDay}
            subtitle="Avg. commands per day"
            icon={<MdOutlineTouchApp size={24} />}
          />
        </div>
      )}

      {/* Main Display: Map or Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full bg-[#195C51] ${
                !loading && "animate-pulse"
              }`}
            ></div>
            Discovery Stream (Last {hours}h)
          </h2>
          <select
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#195C51] shadow-sm outline-none cursor-pointer"
          >
            {[1, 3, 6, 12, 24].map((h) => (
              <option key={h} value={h}>
                Window: {h} Hours
              </option>
            ))}
          </select>
        </div>

        {viewMode === "map" ? (
          /* GEOGRAPHIC DOT DISTRIBUTION */
          <div className="google-card overflow-hidden h-[600px] mx-2 bg-[#F5F5F5] relative border-none shadow-inner">
            {!loading ? (
              <MapContainer
                center={[-1.9441, 30.0619]}
                zoom={12}
                style={{ height: "100%", width: "100%", zIndex: 1 }}
                scrollWheelZoom={false}
              >
                {/* Changed to Voyager tiles for richer colors (Green/Blue/Yellow) */}
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />

                {devices.map((device) => {
                  const coords = device.location?.coordinates?.coordinates;
                  if (!coords || coords.length < 2) return null;

                  const online = isCurrentlyOnline(device);

                  return (
                    <CircleMarker
                      key={device._id}
                      center={[coords[1], coords[0]]}
                      radius={10}
                      pathOptions={{
                        fillColor: online ? "#10b981" : "#64748b",
                        color: "white",
                        weight: 3,
                        fillOpacity: 0.9,
                      }}
                    >
                      <Popup className="custom-popup">
                        <div className="p-3 min-w-[180px] space-y-3">
                          {/* Header */}
                          <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                            <div>
                              <p className="font-black text-[9px] uppercase tracking-widest text-[#195C51]">
                                Serial Number
                              </p>
                              <p className="font-bold text-gray-800 text-xs">
                                {device.serialNumber}
                              </p>
                            </div>
                            <div
                              className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                online
                                  ? "bg-green-50 text-green-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {online ? "Live" : "Idle"}
                            </div>
                          </div>

                          {/* Owner Section */}
                          <div>
                            <p className="font-black text-[9px] uppercase tracking-widest text-gray-400">
                              Authorized Owner
                            </p>
                            <p className="font-bold text-gray-700 text-sm">
                              {getOwnerLabel(device.owner)}
                            </p>
                          </div>

                          {/* Deployment Section */}
                          <div>
                            <p className="font-black text-[9px] uppercase tracking-widest text-gray-400">
                              Deployed At
                            </p>
                            <p className="text-xs text-gray-500 leading-tight">
                              {device.location.address || "Unlabeled Station"}
                            </p>
                          </div>

                          {/* Latency Info */}
                          <p className="text-[9px] font-medium text-gray-400 italic pt-1">
                            {online
                              ? "Synced via Cloud Node"
                              : `Last seen: ${formatDateShort(
                                  device.lastHeartbeatAt,
                                )}`}
                          </p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#195C51]"></div>
              </div>
            )}

            {/* Map Overlay Info (Color Legend) */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10b981] shadow-sm"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#64748b] shadow-sm"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                    Offline
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ANALYTICS TABLE */
          <div className="google-card overflow-hidden bg-white mx-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F5F5F5]/60 border-b border-gray-100">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Node Status
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Hardware Info
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Deployment Location
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                      Last Interaction
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                      Cloud Heartbeat
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {devices.map((device) => {
                    const online = isCurrentlyOnline(device);
                    return (
                      <tr
                        key={device._id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="p-6">
                          <div
                            className={`flex items-center gap-3 ${
                              online ? "text-green-600" : "text-gray-300"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg ${
                                online ? "bg-green-50" : "bg-gray-50"
                              }`}
                            >
                              {online ? (
                                <MdWifi size={18} />
                              ) : (
                                <MdWifiOff size={18} />
                              )}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {online ? "Synced" : "Offline"}
                            </span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="font-bold text-[#333333] text-sm tracking-tight">
                            {device.modelType}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            SN: {device.serialNumber}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-start gap-3">
                            <MdPinDrop
                              className="text-[#195C51] mt-0.5"
                              size={18}
                            />
                            <div>
                              <div className="text-xs font-bold text-gray-700 max-w-[200px] truncate">
                                {device.location?.address ||
                                  "Mobile Node / Unassigned"}
                              </div>
                              <div className="text-[9px] text-gray-400 font-mono tracking-tighter">
                                {device.location?.coordinates?.coordinates
                                  ? `${device.location.coordinates.coordinates[1].toFixed(
                                      5,
                                    )}, ${device.location.coordinates.coordinates[0].toFixed(
                                      5,
                                    )}`
                                  : "Awaiting Fix..."}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="text-xs font-bold text-gray-600">
                            {formatDateLong(device.lastUsedAt)}
                          </div>
                          <div className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">
                            Command Logged
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <span
                            className={`text-xs font-black ${
                              online ? "text-[#195C51]" : "text-gray-400"
                            }`}
                          >
                            {online
                              ? "Active Now"
                              : formatDateShort(device.lastHeartbeatAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {devices.length === 0 && !loading && (
              <div className="p-24 text-center">
                <MdOutlineHourglassEmpty
                  size={48}
                  className="mx-auto text-gray-200 mb-4"
                />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                  Scanning airwaves... no devices detected in this window.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* Sub-component: StatCard */
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "text-[#195C51]",
}) => (
  <div className="google-card p-8 group hover:border-[#195C51]/20 transition-all bg-white shadow-sm hover:shadow-xl">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          {title}
        </p>
        <h3 className={`text-4xl font-bold ${color} tracking-tighter`}>
          {value}
        </h3>
      </div>
      <div className="p-4 rounded-[1.5rem] bg-[#F5F5F5] text-gray-400 group-hover:text-[#195C51] group-hover:bg-[#195C51]/10 transition-all duration-500">
        {icon}
      </div>
    </div>
    <div className="mt-8 pt-4 border-t border-gray-50">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic opacity-60 group-hover:opacity-100 transition-opacity">
        "{subtitle}"
      </p>
    </div>
  </div>
);

/* Date Formatting Helpers */
const formatDateShort = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diff = (now - d) / 1000 / 60; // minutes

  if (diff < 1) return "Seconds ago";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return d.toLocaleDateString();
};

const formatDateLong = (date) => {
  if (!date) return "Never";
  return new Date(date).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default OnlineDevicesDashboard;
