// src/pages/dashboard/AuditLogs.jsx
//
// Admin Audit Logs Viewer
// Displays audit logs with filtering, pagination, and detail view
//

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Calendar, User, Activity, FileText, ChevronDown,
  ChevronUp, RefreshCw, Trash2, Shield, Clock, ArrowUpDown,
  CheckCircle2, XCircle, AlertCircle, Info, Download
} from 'lucide-react';
import { fetchData, returnToken } from '../../utils/helper.js';
import { presence_server } from '../../config/server_api.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) : '—';

const timeAgo = (d) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_TYPE_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'GRANT_SUBSCRIPTION', label: 'Grant Subscription' },
  { value: 'EXTEND_SUBSCRIPTION', label: 'Extend Subscription' },
  { value: 'CUSTOM_ACTION', label: 'Custom Action' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'User', label: 'User' },
  { value: 'Subscription', label: 'Subscription' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Extension', label: 'Extension' },
  { value: 'Button', label: 'Button' },
  { value: 'Port', label: 'Port' },
  { value: 'Share', label: 'Share' },
  { value: 'Notification', label: 'Notification' },
  { value: 'Session', label: 'Session' },
  { value: 'Payment', label: 'Payment' },
  { value: 'Plan', label: 'Plan' },
  { value: 'Organization', label: 'Organization' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'processed', label: 'Processed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

const STATUS_COLORS = {
  processed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
  failed: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
};

// ─── Components ────────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const config = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

const AuditLogCard = ({ log, onExpand, expanded }) => {
  const statusConfig = STATUS_COLORS[log.status] || STATUS_COLORS.pending;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
      {/* Header */}
      <div className="p-4 cursor-pointer" onClick={() => onExpand(log._id)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Status icon */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${statusConfig.bg}`}>
              {React.createElement(statusConfig.icon, { className: `w-4 h-4 ${statusConfig.text}` })}
            </div>

            {/* Main info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-bold text-slate-900">{log.action?.actionType}</span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {log.action?.entityType}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <User className="w-3 h-3" />
                <span className="font-medium">{log.actor?.fullName || log.actor?.email || 'Unknown'}</span>
                <span>·</span>
                <span>{timeAgo(log.request?.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={log.status} />
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4">
          {/* Actor info */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Actor Information</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white border border-slate-200 rounded-lg p-2">
                <p className="text-[9px] font-bold uppercase text-slate-400">Name</p>
                <p className="font-medium text-slate-800">{log.actor?.fullName || '—'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2">
                <p className="text-[9px] font-bold uppercase text-slate-400">Email</p>
                <p className="font-mono text-slate-800">{log.actor?.email || '—'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2">
                <p className="text-[9px] font-bold uppercase text-slate-400">Role</p>
                <p className="font-medium text-slate-800">{log.actor?.role || '—'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2">
                <p className="text-[9px] font-bold uppercase text-slate-400">IP Address</p>
                <p className="font-mono text-slate-800">{log.actor?.ipAddress || '—'}</p>
              </div>
            </div>
          </div>

          {/* Request info */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Request Information</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white border border-slate-200 rounded-lg p-2">
                <p className="text-[9px] font-bold uppercase text-slate-400">Method</p>
                <p className="font-mono text-slate-800">{log.request?.method || '—'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2">
                <p className="text-[9px] font-bold uppercase text-slate-400">Endpoint</p>
                <p className="font-mono text-slate-800 text-[10px] truncate">{log.request?.endpoint || '—'}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2 col-span-2">
                <p className="text-[9px] font-bold uppercase text-slate-400">Timestamp</p>
                <p className="font-medium text-slate-800">{fmtDateTime(log.request?.timestamp)}</p>
              </div>
            </div>
          </div>

          {/* Changes */}
          {log.changes && (log.changes.previousValues || log.changes.newValues) && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Changes</p>
              <div className="space-y-2">
                {log.changes.previousValues && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-[9px] font-bold uppercase text-red-600 mb-1">Previous Values</p>
                    <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(log.changes.previousValues, null, 2)}
                    </pre>
                  </div>
                )}
                {log.changes.newValues && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-[9px] font-bold uppercase text-emerald-600 mb-1">New Values</p>
                    <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(log.changes.newValues, null, 2)}
                    </pre>
                  </div>
                )}
                {log.changes.changedFields && log.changes.changedFields.length > 0 && (
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-2">
                    <p className="text-[9px] font-bold uppercase text-slate-600 mb-1">Changed Fields</p>
                    <div className="flex flex-wrap gap-1">
                      {log.changes.changedFields.map((field, i) => (
                        <span key={i} className="text-[10px] font-medium bg-white px-2 py-0.5 rounded border border-slate-300">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Metadata</p>
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Error */}
          {log.status === 'failed' && log.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-[9px] font-bold uppercase text-red-600 mb-1">Error Details</p>
              <p className="text-xs font-medium text-red-800">{log.error.message}</p>
              {log.error.stack && (
                <details className="mt-2">
                  <summary className="text-[10px] font-bold text-red-600 cursor-pointer">Stack Trace</summary>
                  <pre className="text-[9px] font-mono text-red-700 mt-1 whitespace-pre-wrap overflow-x-auto">
                    {log.error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    userId: '',
    entityType: '',
    actionType: '',
    entityId: '',
    startDate: '',
    endDate: '',
    status: '',
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  const token = returnToken();

  // Load logs
  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);

      const res = await fetchData(`${presence_server}/api/admin/audit/logs?${params.toString()}`, token);
      if (res.data) {
        setLogs(res.data.logs || []);
        setPagination(res.data.pagination || pagination);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
      setError('Failed to load audit logs');
    }
    setLoading(false);
  }, [filters, pagination.page, pagination.limit, token]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    setStatisticsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.userId) params.append('userId', filters.userId);

      const res = await fetchData(`${presence_server}/api/admin/audit/statistics?${params.toString()}`, token);
      if (res.data) {
        setStatistics(res.data.statistics);
      }
    } catch (err) {
      console.error('Failed to load audit statistics', err);
    }
    setStatisticsLoading(false);
  }, [filters.startDate, filters.endDate, filters.userId, token]);

  // Initial load
  useEffect(() => {
    loadLogs();
    loadStatistics();
  }, [loadLogs, loadStatistics]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle refresh
  const handleRefresh = () => {
    loadLogs();
    loadStatistics();
  };

  // Handle cleanup
  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to delete old audit logs? This action cannot be undone.')) return;
    
    const retentionDays = prompt('Enter retention days (logs older than this will be deleted):', '365');
    if (!retentionDays || isNaN(retentionDays)) return;

    try {
      const res = await fetchData(
        `${presence_server}/api/admin/audit/cleanup?retentionDays=${retentionDays}`,
        token,
        'DELETE'
      );
      if (res.data) {
        alert(`Deleted ${res.data.deletedCount} old audit logs`);
        handleRefresh();
      }
    } catch (err) {
      console.error('Failed to cleanup audit logs', err);
      alert('Failed to cleanup audit logs');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">View and filter system audit trails for compliance and security monitoring.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCleanup}
            className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Cleanup
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statisticsLoading && statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-slate-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Logs</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{statistics.totalLogs?.toLocaleString() || '—'}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processed</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{statistics.byStatus?.processed?.toLocaleString() || '—'}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{statistics.byStatus?.pending?.toLocaleString() || '—'}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Failed</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{statistics.byStatus?.failed?.toLocaleString() || '—'}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filters</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* User ID */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">User ID</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="MongoDB ObjectId"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195C51] focus:border-transparent font-mono"
            />
          </div>

          {/* Entity ID */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Entity ID</label>
            <input
              type="text"
              value={filters.entityId}
              onChange={(e) => handleFilterChange('entityId', e.target.value)}
              placeholder="MongoDB ObjectId"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195C51] focus:border-transparent font-mono"
            />
          </div>

          {/* Entity Type */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Entity Type</label>
            <select
              value={filters.entityType}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195C51] focus:border-transparent"
            >
              {ENTITY_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Action Type */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Action Type</label>
            <select
              value={filters.actionType}
              onChange={(e) => handleFilterChange('actionType', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195C51] focus:border-transparent"
            >
              {ACTION_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195C51] focus:border-transparent"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Start Date</label>
              <input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195C51] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">End Date</label>
              <input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#195C51] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#195C51] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">No audit logs found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <AuditLogCard
                key={log._id}
                log={log}
                expanded={expandedLog === log._id}
                onExpand={(id) => setExpandedLog(expandedLog === id ? null : id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} logs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
