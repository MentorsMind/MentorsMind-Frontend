import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import { AdminTransaction, AdminListResponse } from '../../types/admin.types';
import apiClient from '../../services/api.client';

const AdminTransactions: React.FC = () => {
  const [data, setData] = useState<AdminTransaction[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: 50, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (offset = 0, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AdminListResponse<AdminTransaction>>(
        `/admin/transactions?limit=${limit}&offset=${offset}`
      );
      setData(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePageChange = (offset: number) => {
    fetchTransactions(offset, meta.limit);
  };

  const handleLimitChange = (limit: number) => {
    fetchTransactions(0, limit);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <span className="capitalize">{value}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: number, item: AdminTransaction) => `${value} ${item.asset}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors = {
          completed: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          failed: 'bg-red-100 text-red-800',
          refunded: 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'userName',
      label: 'User',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500">View all platform transactions</p>
      </div>

      <AdminTable
        data={data}
        columns={columns}
        meta={meta}
        loading={loading}
        error={error}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        title="Transactions"
      />
    </div>
  );
};

export default AdminTransactions;