import React, { useState, useEffect } from 'react';
import { AdminTable } from './AdminTable';
import { AdminUser, AdminListResponse } from '../../types/admin.types';
import apiClient from '../../services/api.client';

const ROLE_OPTIONS = ['All', 'Mentee', 'Mentor', 'Admin'] as const;
type RoleFilter = typeof ROLE_OPTIONS[number];

const AdminUsers: React.FC = () => {
  const [data, setData] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({ total: 0, limit: 50, offset: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All');

  const fetchUsers = async (offset = 0, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (roleFilter !== 'All') {
        params.append('role', roleFilter.toLowerCase());
      }

      const response = await apiClient.get<AdminListResponse<AdminUser>>(`/admin/users?${params}`);
      setData(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(meta.offset, meta.limit);
  }, [roleFilter]);

  const handlePageChange = (offset: number) => {
    fetchUsers(offset, meta.limit);
  };

  const handleLimitChange = (limit: number) => {
    fetchUsers(0, limit);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          suspended: 'bg-red-100 text-red-800',
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
      key: 'lastActive',
      label: 'Last Active',
      sortable: true,
      render: (value?: string) => value ? new Date(value).toLocaleDateString() : 'Never',
    },
  ];

  const filters = (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium text-gray-700">Role:</label>
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500">Manage platform users</p>
      </div>

      <AdminTable
        data={data}
        columns={columns}
        meta={meta}
        loading={loading}
        error={error}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        title="Users"
        filters={filters}
      />
    </div>
  );
};

export default AdminUsers;