import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import { AdminDispute, AdminListResponse } from '../../types/admin.types';
import apiClient from '../../services/api.client';

const AdminDisputes: React.FC = () => {
  const [data, setData] = useState<AdminDispute[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: 50, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = async (offset = 0, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AdminListResponse<AdminDispute>>(
        `/admin/disputes?limit=${limit}&offset=${offset}`
      );
      setData(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
      setError('Failed to load disputes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handlePageChange = (offset: number) => {
    fetchDisputes(offset, meta.limit);
  };

  const handleLimitChange = (limit: number) => {
    fetchDisputes(0, limit);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'sessionId',
      label: 'Session ID',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
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
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: number, item: AdminDispute) => `${value} ${item.asset}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors = {
          open: 'bg-red-100 text-red-800',
          investigating: 'bg-yellow-100 text-yellow-800',
          resolved: 'bg-green-100 text-green-800',
          closed: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'resolvedAt',
      label: 'Resolved',
      sortable: true,
      render: (value?: string) => value ? new Date(value).toLocaleDateString() : '-',
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Disputes</h1>
        <p className="text-gray-500">Manage session disputes</p>
      </div>

      <AdminTable
        data={data}
        columns={columns}
        meta={meta}
        loading={loading}
        error={error}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        title="Disputes"
      />
    </div>
  );
};

export default AdminDisputes;