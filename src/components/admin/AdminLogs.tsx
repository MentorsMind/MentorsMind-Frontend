import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import { AdminLog, AdminListResponse } from '../../types/admin.types';
import apiClient from '../../services/api.client';

const LEVEL_OPTIONS = ['All', 'info', 'warn', 'error'] as const;
type LevelFilter = typeof LEVEL_OPTIONS[number];

const AdminLogs: React.FC = () => {
  const [data, setData] = useState<AdminLog[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: 50, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('All');
  const [actionFilter, setActionFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');

  const fetchLogs = async (offset = 0, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (levelFilter !== 'All') {
        params.append('level', levelFilter);
      }
      if (actionFilter) {
        params.append('action', actionFilter);
      }
      if (userIdFilter) {
        params.append('userId', userIdFilter);
      }

      const response = await apiClient.get<AdminListResponse<AdminLog>>(`/admin/logs?${params}`);
      setData(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError('Failed to load logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(meta.offset, meta.limit);
  }, [levelFilter, actionFilter, userIdFilter]);

  const handlePageChange = (offset: number) => {
    fetchLogs(offset, meta.limit);
  };

  const handleLimitChange = (limit: number) => {
    fetchLogs(0, limit);
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (value: string) => {
        const colors = {
          info: 'bg-blue-100 text-blue-800',
          warn: 'bg-yellow-100 text-yellow-800',
          error: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
    },
    {
      key: 'userName',
      label: 'User',
      sortable: true,
      render: (value?: string, item: AdminLog) => value || (item.userId ? `ID: ${item.userId}` : '-'),
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      sortable: true,
    },
    {
      key: 'details',
      label: 'Details',
      sortable: false,
    },
  ];

  const filters = (
    <div className="flex items-center gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Level:</label>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {LEVEL_OPTIONS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Action:</label>
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter by action"
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User ID:</label>
        <input
          type="text"
          value={userIdFilter}
          onChange={(e) => setUserIdFilter(e.target.value)}
          placeholder="Filter by user ID"
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logs</h1>
        <p className="text-gray-500">View system logs and activities</p>
      </div>

      <AdminTable
        data={data}
        columns={columns}
        meta={meta}
        loading={loading}
        error={error}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        title="System Logs"
        filters={filters}
      />
    </div>
  );
};

export default AdminLogs;