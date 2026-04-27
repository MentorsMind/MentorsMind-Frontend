import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import { AdminSession, AdminListResponse } from '../../types/admin.types';
import apiClient from '../../services/api.client';

const AdminSessions: React.FC = () => {
  const [data, setData] = useState<AdminSession[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: 50, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async (offset = 0, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AdminListResponse<AdminSession>>(
        `/admin/sessions?limit=${limit}&offset=${offset}`
      );
      setData(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handlePageChange = (offset: number) => {
    fetchSessions(offset, meta.limit);
  };

  const handleLimitChange = (limit: number) => {
    fetchSessions(0, limit);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'mentorName',
      label: 'Mentor',
      sortable: true,
    },
    {
      key: 'learnerName',
      label: 'Learner',
      sortable: true,
    },
    {
      key: 'scheduledAt',
      label: 'Scheduled',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (value: number) => `${value} min`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-blue-100 text-blue-800',
          completed: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
          rescheduled: 'bg-purple-100 text-purple-800',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value: number, item: AdminSession) => `${value} ${item.asset}`,
    },
    {
      key: 'topic',
      label: 'Topic',
      sortable: true,
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-500">View all mentoring sessions</p>
      </div>

      <AdminTable
        data={data}
        columns={columns}
        meta={meta}
        loading={loading}
        error={error}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        title="Sessions"
      />
    </div>
  );
};

export default AdminSessions;