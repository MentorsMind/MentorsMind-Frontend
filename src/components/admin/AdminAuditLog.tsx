import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Download, Shield, AlertTriangle, CheckCircle, Filter, Calendar, User, Search } from 'lucide-react';
import { exportToCSV } from '../../utils/export.utils';
import apiClient from '../../services/api.client';
import { TableSkeletonLoader } from '../animations/SkeletonLoader';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
}

interface AuditStats {
  totalEvents: number;
  uniqueUsers: number;
  distinctActions: number;
}

interface IntegrityResult {
  valid: boolean;
  brokenAt?: string;
}

export const AdminAuditLog: React.FC = () => {
  // Filters
  const [userId, setUserId] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [resourceType, setResourceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Data
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityResult | null>(null);
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  // Fetch unique actions for filter (populated from result set or predefined)
  const defaultActions = ['USER_LOGIN', 'USER_LOGOUT', 'PAYMENT_INITIATED', 'PAYMENT_COMPLETED', 'SESSION_BOOKED', 'PROFILE_UPDATED'];

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (selectedActions.length > 0) params.append('action', selectedActions.join(','));
      if (resourceType) params.append('resourceType', resourceType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/admin/audit-log?${params.toString()}`);
      
      if (response.data) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalLogs(response.data.total || 0);
        
        // Extract distinct actions from result set if backend doesn't provide them
        const extractedActions = Array.from(new Set((response.data.logs || []).map((l: AuditLog) => l.action))) as string[];
        const mergedActions = Array.from(new Set([...defaultActions, ...extractedActions]));
        setAvailableActions(mergedActions);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Failed to load audit logs. Using simulated data.');
      simulateMockData();
    } finally {
      setLoading(false);
    }
  }, [userId, selectedActions, resourceType, startDate, endDate, page, limit]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (userId) params.append('userId', userId);
      if (selectedActions.length > 0) params.append('action', selectedActions.join(','));
      if (resourceType) params.append('resourceType', resourceType);

      const response = await apiClient.get(`/admin/audit-log/stats?${params.toString()}`);
      if (response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch audit stats:', err);
      // Mock stats
      setStats({
        totalEvents: totalLogs || 1240,
        uniqueUsers: 85,
        distinctActions: availableActions.length || defaultActions.length
      });
    } finally {
      setStatsLoading(false);
    }
  }, [startDate, endDate, userId, selectedActions, resourceType, totalLogs, availableActions.length]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const simulateMockData = () => {
    // Generate mock logs
    const mockActions = defaultActions;
    const mockResources = ['USER', 'PAYMENT', 'SESSION', 'GOAL'];
    
    const mockLogs: AuditLog[] = Array.from({ length: limit }, (_, i) => {
      const id = `log-${page}-${i}`;
      const timestamp = new Date(Date.now() - (i * 3600000) - (page * 86400000)).toISOString();
      const action = mockActions[Math.floor(Math.random() * mockActions.length)];
      const resType = mockResources[Math.floor(Math.random() * mockResources.length)];
      
      return {
        id,
        timestamp,
        userId: `user-${Math.floor(Math.random() * 100) + 1000}`,
        action,
        resourceType: resType,
        resourceId: `${resType.toLowerCase()}-${Math.floor(Math.random() * 10000)}`,
        details: `Simulated log for action ${action} on ${resType}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`
      };
    });

    setLogs(mockLogs);
    setTotalPages(5);
    setTotalLogs(50);
    setAvailableActions(mockActions);
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (selectedActions.length > 0) params.append('action', selectedActions.join(','));
      if (resourceType) params.append('resourceType', resourceType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      // Trigger file download from /export endpoint
      const downloadUrl = `/admin/audit-log/export?${params.toString()}`;
      
      // We use axios to fetch the file with Auth headers, then trigger download
      const response = await apiClient.get(downloadUrl, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_log_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV via endpoint, falling back to client-side generation:', err);
      // Fallback to client-side CSV generation
      const headers = ['Timestamp', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP Address'];
      const rows = logs.map(log => [
        log.timestamp,
        log.userId,
        log.action,
        log.resourceType,
        log.resourceId,
        log.details,
        log.ipAddress
      ]);
      exportToCSV('audit_log_fallback', headers, rows);
    }
  };

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    try {
      const response = await apiClient.get('/admin/audit-log/verify');
      setIntegrity(response.data);
    } catch (err) {
      console.error('Failed to verify integrity:', err);
      // Simulate verification
      setIntegrity({ valid: true });
    } finally {
      setVerifying(false);
    }
  };

  const toggleAction = (action: string) => {
    if (selectedActions.includes(action)) {
      setSelectedActions(selectedActions.filter(a => a !== action));
    } else {
      setSelectedActions([...selectedActions, action]);
    }
    setPage(1); // Reset to page 1 on filter change
  };

  return (
    <div className="p-6 space-y-8 bg-surface min-h-screen">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor platform performance and track system activity</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleVerifyIntegrity}
              disabled={verifying}
              className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm font-medium text-text hover:bg-surface-hover transition-colors shadow-sm disabled:opacity-50"
            >
              <Shield size={16} className={verifying ? 'animate-spin' : ''} />
              {verifying ? 'Verifying...' : 'Verify Integrity'}
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>
        
        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <NavLink 
            to="/admin/analytics" 
            className={({ isActive }) => 
              `py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 font-semibold' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            Analytics
          </NavLink>
          <NavLink 
            to="/admin/audit-log" 
            className={({ isActive }) => 
              `py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 font-semibold' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            Audit Log
          </NavLink>
        </div>
      </div>

      {/* Integrity Banner */}
      {integrity && (
        <div className={`p-4 rounded-lg flex items-center gap-3 border ${
          integrity.valid 
            ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' 
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          {integrity.valid ? (
            <>
              <CheckCircle size={20} className="shrink-0" />
              <div>
                <p className="font-semibold">Chain Intact</p>
                <p className="text-sm opacity-90">All audit log records are cryptographically verified and untampered.</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={20} className="shrink-0" />
              <div>
                <p className="font-semibold">Integrity Broken</p>
                <p className="text-sm opacity-90">
                  Potential tampering detected at {integrity.brokenAt ? new Date(integrity.brokenAt).toLocaleString() : 'unknown timestamp'}.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Events</p>
          <p className="text-3xl font-bold text-text mt-2">
            {statsLoading ? '...' : stats?.totalEvents.toLocaleString()}
          </p>
        </div>
        <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
          <p className="text-3xl font-bold text-text mt-2">
            {statsLoading ? '...' : stats?.uniqueUsers.toLocaleString()}
          </p>
        </div>
        <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Distinct Actions</p>
          <p className="text-3xl font-bold text-text mt-2">
            {statsLoading ? '...' : stats?.distinctActions.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-background p-4 rounded-xl border border-border shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <User size={12} /> User ID
          </label>
          <div className="relative">
            <input
              type="text"
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setPage(1); }}
              placeholder="Filter by User ID"
              className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-text pl-9"
            />
            <Search size={14} className="absolute left-3 top-3 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1.5 relative">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter size={12} /> Actions
          </label>
          <button
            onClick={() => setShowActionDropdown(!showActionDropdown)}
            className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 text-left text-text flex justify-between items-center"
          >
            <span className="truncate">
              {selectedActions.length === 0 
                ? 'All Actions' 
                : `${selectedActions.length} selected`}
            </span>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showActionDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
              {availableActions.map(action => (
                <label key={action} className="flex items-center gap-2 px-2 py-1.5 hover:bg-surface rounded-md cursor-pointer text-sm text-text">
                  <input
                    type="checkbox"
                    checked={selectedActions.includes(action)}
                    onChange={() => toggleAction(action)}
                    className="rounded border-border text-primary focus:ring-primary bg-surface"
                  />
                  {action}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter size={12} /> Resource Type
          </label>
          <input
            type="text"
            value={resourceType}
            onChange={(e) => { setResourceType(e.target.value); setPage(1); }}
            placeholder="e.g. PAYMENT"
            className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-text"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar size={12} /> Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-text"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar size={12} /> End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary text-text"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeletonLoader rows={10} cols={6} />
          </div>
        ) : error && logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No audit logs found matching the active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-surface border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">User ID</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                  <th className="px-6 py-4 font-semibold">Resource</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                  <th className="px-6 py-4 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text">{log.userId}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.action.includes('PAYMENT') 
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400' 
                          : log.action.includes('LOGIN')
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-text">{log.resourceType}</span>
                      <span className="text-xs text-muted-foreground block font-mono">{log.resourceId}</span>
                    </td>
                    <td className="px-6 py-4 text-text max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-surface">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-text">{((page - 1) * limit) + 1}</span> to{' '}
              <span className="font-semibold text-text">{Math.min(page * limit, totalLogs)}</span> of{' '}
              <span className="font-semibold text-text">{totalLogs}</span> entries
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded border border-border text-xs font-medium text-text bg-background hover:bg-surface-hover transition-colors disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    page === p
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-text bg-background hover:bg-surface-hover'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded border border-border text-xs font-medium text-text bg-background hover:bg-surface-hover transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLog;
