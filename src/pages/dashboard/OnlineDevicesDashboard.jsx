import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw, Clock, Server, AlertCircle } from 'lucide-react';
import { fetchData, returnToken } from "../../utils/helper.js";
import { presence_server } from "../../config/server_api.js";

const OnlineDevicesDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hours, setHours] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // all, online, offline
  const [enabledFilter, setEnabledFilter] = useState('all'); // all, yes, no
  const [modelFilter, setModelFilter] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef(null);

  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Load devices from API
  const loadDevices = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = `${presence_server}/statistics/recently-online?hours=${hours}`;
      const result = await fetchData(apiUrl, returnToken());

      if (result.error) {
        setError(result.error);
        setDevices([]);
      } else {
        setDevices(result.data.devices || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load devices");
      setDevices([]);
    }

    setLoading(false);
    setLastRefresh(new Date());
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 30000);
    return () => clearInterval(interval);
  }, [hours]);

  // Debounced search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400); // 400ms debounce
  };

  // Utility: check if device is currently online
  const isCurrentlyOnline = (device) => {
    const lastHeartbeat = new Date(device.lastHeartbeatAt);
    const threshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
    return lastHeartbeat >= threshold;
  };

  // Format timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '—';
    const date = new Date(timestamp);
    const diffMins = Math.floor((Date.now() - date) / 60000);
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString();
  };

  // Apply filters and search
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const online = isCurrentlyOnline(device);

      // Status filter
      if (statusFilter === 'online' && !online) return false;
      if (statusFilter === 'offline' && online) return false;

      // Enabled filter
      if (enabledFilter === 'yes' && !device.isEnabled) return false;
      if (enabledFilter === 'no' && device.isEnabled) return false;

      // Model & Manufacturer filters
      if (modelFilter && !device.modelType.toLowerCase().includes(modelFilter.toLowerCase())) return false;
      if (manufacturerFilter && !device.manufacture.toLowerCase().includes(manufacturerFilter.toLowerCase())) return false;

      // Search filter (debounced)
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        if (
          !device.modelType.toLowerCase().includes(searchLower) &&
          !device.manufacture.toLowerCase().includes(searchLower)
        ) return false;
      }

      return true;
    });
  }, [devices, statusFilter, enabledFilter, modelFilter, manufacturerFilter, debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">

        {/* Header & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Server className="text-indigo-600" size={24} /> Online Devices
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              {/* Hours filter */}
              <select
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1,3,6,12,24].map(h => <option key={h} value={h}>{h}h</option>)}
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 bg-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>

              {/* Enabled filter */}
              <select
                value={enabledFilter}
                onChange={(e) => setEnabledFilter(e.target.value)}
                className="border bg-white  border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Enabled</option>
                <option value="yes">Enabled</option>
                <option value="no">Disabled</option>
              </select>

              {/*/!* Model & Manufacturer inputs *!/*/}
              {/*<input*/}
              {/*  type="text"*/}
              {/*  placeholder="Filter model..."*/}
              {/*  value={modelFilter}*/}
              {/*  onChange={(e) => setModelFilter(e.target.value)}*/}
              {/*  className="border bg-white  border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"*/}
              {/*/>*/}
              {/*<input*/}
              {/*  type="text"*/}
              {/*  placeholder="Filter manufacturer..."*/}
              {/*  value={manufacturerFilter}*/}
              {/*  onChange={(e) => setManufacturerFilter(e.target.value)}*/}
              {/*  className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"*/}
              {/*/>*/}

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search model or manufacturer..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => { setSearchTerm(''); setDebouncedSearch(''); }}
                    className="absolute right-1 top-1 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Refresh */}
              <button
                onClick={loadDevices}
                disabled={loading}
                className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Clock size={12}/> {lastRefresh.toLocaleTimeString()}</span>
            <span>Total: {filteredDevices.length}</span>
            <span className="text-green-600">Online: {filteredDevices.filter(isCurrentlyOnline).length}</span>
            <span className="text-blue-600">Enabled: {filteredDevices.filter(d => d.isEnabled).length}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
            <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
            <p className="text-red-800 text-sm font-medium">Error: {error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && filteredDevices.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <RefreshCw className="animate-spin mx-auto text-indigo-600 mb-2" size={32} />
            <p className="text-gray-600 text-sm">Loading devices...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredDevices.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <WifiOff className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">No devices match your filters or search</p>
          </div>
        )}

        {/* Devices Table */}
        {filteredDevices.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Model</th>
                    <th className="text-left p-3 font-medium text-gray-700">Manufacturer</th>
                    <th className="text-left p-3 font-medium text-gray-700">Version</th>
                    <th className="text-left p-3 font-medium text-gray-700">State</th>
                    <th className="text-left p-3 font-medium text-gray-700">Ping</th>
                    <th className="text-left p-3 font-medium text-gray-700">Last Used</th>
                    <th className="text-left p-3 font-medium text-gray-700">Enabled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDevices.map(device => {
                    const online = isCurrentlyOnline(device);
                    return (
                      <tr key={device._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className={`flex items-center gap-1 ${online ? 'text-green-600' : 'text-gray-400'}`}>
                            {online ? <Wifi size={16}/> : <WifiOff size={16}/>}
                            <span className="text-xs font-medium">{online ? 'Online' : 'Offline'}</span>
                          </div>
                        </td>
                        <td className="p-3 font-medium text-gray-800 uppercase">{device.modelType}</td>
                        <td className="p-3 text-gray-700">{device.manufacture}</td>
                        <td className="p-3 text-gray-600 font-mono text-xs">{device.version}</td>
                        <td className="p-3 capitalize text-gray-700">{device.state}</td>
                        <td className="p-3 text-gray-600">{formatTimestamp(device.lastHeartbeatAt)}</td>
                        <td className="p-3 text-gray-600">{formatTimestamp(device.lastUsedAt)}</td>
                        <td className="p-3">
                          {device.isEnabled ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">ENABLED</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">DISABLED</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OnlineDevicesDashboard;
