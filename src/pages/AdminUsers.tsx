import { useEffect, useMemo, useState } from "react";
import UserService, {
  type AdminUserListItem,
  type AdminUserSensitiveData,
} from "../services/user.service";
import { handleApiError } from "../services/api.error.handler";

const userService = new UserService();

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [needsSensitiveConfirm, setNeedsSensitiveConfirm] = useState(false);
  const [sensitiveData, setSensitiveData] = useState<AdminUserSensitiveData | null>(null);
  const [loadingSensitive, setLoadingSensitive] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const safeUsers = await userService.listUsersSafe();
        setUsers(safeUsers);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, []);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const openSensitiveSection = (userId: string) => {
    setSelectedUserId(userId);
    setNeedsSensitiveConfirm(true);
    setSensitiveData(null);
  };

  const revealSensitiveData = async () => {
    if (!selectedUserId) {
      return;
    }

    setLoadingSensitive(true);
    try {
      const data = await userService.getSensitiveData(selectedUserId);
      setSensitiveData(data);
      setNeedsSensitiveConfirm(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingSensitive(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
          <p className="text-sm text-gray-600">User table shows only non-sensitive fields.</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-700">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">First Name</th>
                <th className="px-4 py-3">Last Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Is Active</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Average Rating</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={9}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={9}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.first_name}</td>
                    <td className="px-4 py-3">{user.last_name}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3">{user.is_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">{user.average_rating ?? "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openSensitiveSection(user.id)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                      >
                        Sensitive Data
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <section className="rounded-lg border border-amber-300 bg-amber-50 p-4">
            <h2 className="text-lg font-semibold text-amber-900">Sensitive Data</h2>
            <p className="mt-1 text-sm text-amber-800">
              User: {selectedUser.email} ({selectedUser.id})
            </p>

            {needsSensitiveConfirm ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-amber-900">
                  This section contains sensitive personal information. Confirm to reveal.
                </p>
                <button
                  type="button"
                  disabled={loadingSensitive}
                  onClick={revealSensitiveData}
                  className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {loadingSensitive ? "Loading..." : "Confirm and reveal sensitive data"}
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded border border-amber-200 bg-white p-3">
                  <div className="text-gray-500">Phone Number</div>
                  <div className="font-medium text-gray-900">{sensitiveData?.phone_number || "-"}</div>
                </div>
                <div className="rounded border border-amber-200 bg-white p-3">
                  <div className="text-gray-500">Date of Birth</div>
                  <div className="font-medium text-gray-900">{sensitiveData?.date_of_birth || "-"}</div>
                </div>
                <div className="rounded border border-amber-200 bg-white p-3">
                  <div className="text-gray-500">Government ID Number</div>
                  <div className="font-medium text-gray-900">{sensitiveData?.government_id_number || "-"}</div>
                </div>
                <div className="rounded border border-amber-200 bg-white p-3">
                  <div className="text-gray-500">Bank Account Details</div>
                  <div className="font-medium text-gray-900">{sensitiveData?.bank_account_details || "-"}</div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
